import { Router } from 'express';
import { CtrlHandler } from './utils';
import schema from '../schemas/short';
import crypto from 'crypto';
import { vdtShortened } from '../validation/shortened'
import reduceSum from 'reduce-sum'

const rtr = Router();

const parseIps = (ips) => {
    if (Array.isArray(ips)) {
        return ips.length > 0 ? ips[ips.length - 1] : false;
    }
    if (!ips) return false;
    if (typeof ips === 'string') {
        const [ip_address] = ips.split(',');
        return ip_address;
    }
    return ips;
}

const getIpAddr = (req) => {
    const { headers, ip, hostname, ips } = req;
    return parseIps(headers['x-forwarded-for']) || parseIps(ips) || ip || hostname;
}

rtr.get('/find', (req, res) => {
    CtrlHandler(req, res, async () => {
        const { _id } = res.locals.udata;
        const result = await schema.find({ user: _id }, {}, { sort: { _id: -1 } });
        return result;
    })
});

rtr.post('/add', (req, res) => {
    CtrlHandler(req, res, async (body) => {
        await vdtShortened(body)
        var key = crypto.randomBytes(3).toString('hex')
        const ip_address = getIpAddr(req);
        const { _id } = res.locals.udata;
        const result = await schema.create({ ...body, key, ip_address, user: _id });
        return result;
    })
});

rtr.get('/total_url', (req, res) => {
    CtrlHandler(req, res, async (body) => {
        const { _id } = res.locals.udata;
        const result = await schema.find({ user: _id });
        let totalClick = reduceSum(result, 'click')
        return { total_click: totalClick, total_url: result.length };
    })
});

export default rtr;