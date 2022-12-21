import { Router } from 'express';
import { CtrlHandler } from './utils';
import { insert, update, findall } from '../models/users';

const rtr = Router();

rtr.get('/', (req, res) => {
    CtrlHandler(req, res, async () => {
        const { perPage, page, search } = req.query;
        let filter = {};
        if (search !== '') {
            const reg = new RegExp(search, 'i');
            filter = {
                $or: [
                    { username: reg },
                ]
            }
        }
        return await findall(page, perPage, filter, { priority: -1, _id: -1 });
    })
});

rtr.post('/', (req, res) => {
    CtrlHandler(req, res, async (body) => {
        const { isCreate, _id: id, ...less } = body;
        if (isCreate) {
            return await insert(less);
        }
        return await update(less, id);
    })
});

export default rtr;