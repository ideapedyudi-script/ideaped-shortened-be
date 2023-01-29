import { Router } from 'express';
import shortenedCtrls from './controllers/shortened';
import { AppVersion, getUpdateLogs } from './appVersion';
import AuthController from './controllers/auth';
import { AuthMiddleware } from './controllers/utils';
import UserCtrls from './controllers/users';
import shortenedAll from './controllers/shortened_all';

const rtr = Router();

// --------------- version -------------------
rtr.get('/version', (req, res) => {
    res.json({ error: 0, data: { version: AppVersion, history: getUpdateLogs() } });
});

// --------------- middleware -------------------
rtr.use('/auth', AuthController);

rtr.use('/api/v1', AuthMiddleware);

// --------------- users -------------------
rtr.use('/api/v1/users', UserCtrls);

// --------------- users -------------------
rtr.use('/api/v1/short', shortenedAll);

// --------------- shortened -------------------
rtr.use('/', shortenedCtrls);

export default rtr;