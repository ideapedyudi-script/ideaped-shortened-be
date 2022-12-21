import { Router } from 'express';
import { CtrlHandler } from './utils';
import schema from '../schemas/shortened';
import crypto from 'crypto';
import { vdtShortened } from '../validation/shortened'

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

rtr.post('/shortened', (req, res) => {
    CtrlHandler(req, res, async (body) => {
        await vdtShortened(body)
        var key = crypto.randomBytes(3).toString('hex')
        const ip_address = getIpAddr(req);
        const result = await schema.create({ ...body, key, ip_address });
        return result;
    })
});

rtr.get('/:id', (req, res) => {
    CtrlHandler(req, res, async () => {
        const { id } = req.params;
        const key = await schema.findOne({ key: id })
        if (key) {
            return res.redirect(301, key.redirect_uri);
        } else {
            return res.redirect(301, process.env.DEFAULT_URL);
        }
    })
});

export default rtr;