import { Router } from 'express';
import { AuthMiddleware, CtrlHandler } from './utils';
import { refreshToken } from '../library/signer';
import { changePassword, createDefaultUser, Login, updateProfile, loginGoogle } from '../models/users';
import { insert } from '../models/users';

const rtr = Router();

rtr.post('/login', (req, res) => {
    CtrlHandler(req, res, async (body) => {
        const { email, password } = body;
        try {
            const [token] = await Login(email, password);
            return token;
        } catch (error) {
            throw error;
        }
    });
});

rtr.post('/google', (req, res) => {
    CtrlHandler(req, res, async (body) => {
        const { idToken } = body;
        try {
            const [token] = await loginGoogle(idToken);
            return token;
        } catch (error) {
            throw error;
        }
    });
});

rtr.post('/register', (req, res) => {
    CtrlHandler(req, res, async (body) => {
        return await insert(body);
    })
});

rtr.post('/createDefaultUser', (req, res) => {
    CtrlHandler(req, res, async (body) => {
        const { password } = body;
        return await createDefaultUser(password)
    });
});

rtr.use('/logout', AuthMiddleware);
rtr.use('/refreshToken', AuthMiddleware);
rtr.use('/profile', AuthMiddleware);
rtr.use('/changePassword', AuthMiddleware);
rtr.use('/me', AuthMiddleware);

rtr.get('/logout', (req, res) => {
    CtrlHandler(req, res, async () => {
        return true;
    });
});

rtr.get('/refreshToken', (req, res) => {
    CtrlHandler(req, res, async () => {
        return refreshToken(res.locals.token);
    });
});

rtr.get('/me', (req, res) => {
    CtrlHandler(req, res, async () => {
        return res.locals.udata;
    });
});

rtr.post('/profile', (req, res) => {
    CtrlHandler(req, res, async (body) => {
        const { _id } = res.locals.udata;
        return await updateProfile(_id, body);
    });
});

rtr.post('/changePassword', (req, res) => {
    CtrlHandler(req, res, async (body) => {
        const { username } = res.locals.udata;
        const { password, current } = body;
        await changePassword(username, current, password);
        return password;
    });
});

export default rtr;