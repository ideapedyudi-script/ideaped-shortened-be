
import { Router } from 'express';
import { CtrlHandler } from './utils';
import { OAuth2Client } from 'google-auth-library';
import USERSCH from '../schemas/users';
import { signer } from '../library/signer';

const app = Router();
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

app.post('/auth/google/callback', async (req, res) => {
    CtrlHandler(req, res, async (body) => {
        const { idToken } = body;
        const result = await authenticateWithGoogle(idToken);
        const { password: pwd, ...less } = result?._doc;
        const [token] = await [signer({ ...less }), result];
        return token;
    })
});

export default app;