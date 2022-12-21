import USERSCH from '../schemas/users';
import { signer } from '../library/signer';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import m from 'mongoose';
import { reqPaging } from './utils';
import { AppVersion } from '../appVersion';

const defaultUsername = 'admin';
const defaultEmail = 'admin@gmail.com';
const defaultLevel = 0x1fff0;

const makeHashPassword = (email, password) => {
    const salt = process.env.SALT || 'SADHUWHENDMSABVHSACJASLWQPR';
    var hash = crypto.createHmac('sha256', salt);
    hash.update(email);
    hash.update(password);
    return hash.digest('hex');
}

export const Login = async (email, password) => {
    const hashed = makeHashPassword(email, password);
    const uData = await USERSCH.findOne({ email, password: hashed }, '', { lean: true });
    if (!uData) {
        throw new Error(`User ${email} Not Found or Wrong Password!`);
    }
    const { password: pwd, ...less } = uData;
    const level = less.level;
    const ver = AppVersion;
    return [signer({ ...less, level, be_version: ver }), uData];
}

const CLIENT_ID = '707788443358-u05p46nssla3l8tmn58tpo9r5sommgks.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const authenticateWithGoogle = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload['email'];
    const username = payload['name'];

    let user = await USERSCH.findOne({ email: email });
    if (!user) {
        user = new USERSCH({
            username: username,
            email: email,
            password: '',
            level: 1
        });
        await user.save();
    }
    return user;
}

export const loginGoogle = async (idToken) => {
    const result = await authenticateWithGoogle(idToken);
    const { password: pwd, ...less } = result?._doc;
    return [signer({ ...less }), result];
}

export const findall = async (page, perPage, filter = {}, sort = { _id: -1 }, projection = '') => {
    const offset = (page - 1) * perPage;
    const data = await USERSCH.find(filter, '-password', { skip: parseInt(offset), limit: parseInt(perPage), sort });
    const total = await USERSCH.countDocuments(filter);
    return { data, total };
}

export const getAll = async (level) => {
    return await USERSCH.find({ level: { $lte: level } }, '-password');
}

export const insert = async (data) => {
    const { password: pwd, email, ...less } = data;

    const exists = await USERSCH.findOne({ email });
    if (!!exists) throw new Error('Email Registered!');

    const password = makeHashPassword(email, pwd);
    const resp = await USERSCH.create({ ...less, email, password, level: 1 });
    const { password: pwd2, _id, level, __v, ...result } = JSON.parse(JSON.stringify(resp));
    return result;
}

export const update = async (data, id) => {
    const { password: pwd, email, ...less } = data;
    if (pwd !== '') {
        const password = makeHashPassword(email, pwd);
        const resp = await USERSCH.findOneAndUpdate({ _id: m.Types.ObjectId(id) }, { $set: { ...less, password } });
        const { password: pwd2, ...result } = resp;
        return result;
    }
    const resp = await USERSCH.findOneAndUpdate({ _id: m.Types.ObjectId(id) }, { $set: { ...less } });
    const { password: pwd2, ...result } = resp;
    return result;
}

export const updateProfile = async (userId, body) => {
    const { name, email, phone } = body;
    await USERSCH.updateOne({ _id: m.Types.ObjectId(userId) }, { $set: { name, email, phone } });
    const usr = await USERSCH.findOne({ _id: m.Types.ObjectId(userId) }, '', { lean: true });
    const { password, ...less } = usr;
    return signer(less);
}

export const changePassword = async (email, current, password) => {
    const hashed = makeHashPassword(email, password);
    const currPass = makeHashPassword(email, current);

    const correct = await USERSCH.findOne({ email, password: currPass });
    if (!correct) throw new Error('Wrong Current Password!');
    return await USERSCH.updateOne({ email }, { $set: { password: hashed } });
}

export const createUser = async (userData) => {
    const { email, password, ...etc } = userData;
    const hashed = makeHashPassword(email, password);
    const resp = await USERSCH.create({ ...etc, email, password: hashed });
    const { password: pswd, ...less } = resp._id;
    return less;
}

export const createDefaultUser = async (password) => {
    const exists = await USERSCH.findOne({ email: defaultEmail });
    if (!!exists) throw new Error('User Default Exists!');
    return await createUser({ username: defaultUsername, password, email: defaultEmail, level: defaultLevel });
}

export const paging = async (page, perPage, search, level) => {
    const filter = {
        level: { $lte: level },
        $or: [
            { email: new RegExp(search, 'i') }
        ]
    };
    return await reqPaging(USERSCH, page, perPage, filter);
}