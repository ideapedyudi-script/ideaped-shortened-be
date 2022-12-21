import { decode } from '../library/signer';
import { Router } from 'express';
import { createModel } from '../models/utils';

export const AuthMiddleware = (req, res, next) => {
    const authHeader = process.env.AUTHHEADER || 'srawungtoken';
    const aToken = req.headers[authHeader] || req.query?.token;

    if (!aToken) {
        res.json({ error: 403, message: "Failed Token!" });
    }
    else {
        const start = new Date().getTime();
        res.set("before-token-timestamps", start);
        const uData = decode(aToken);
        if (!uData) {
            res.json({ error: 401, message: 'Auth Token Invalid or Expired!' });
        }
        else {
            res.locals.udata = { ...uData };
            res.locals.token = aToken;
            const end = new Date().getTime();
            res.set("after-token-timestamps", end);
            res.set('token-time-ms', end - start);
            next();
        }
    }
}

export const CtrlHandler = async (req, res, callback) => {
    let jres = {
        error: 0,
        data: [],
        message: '',
        stack: {},
        errorName: ''
    }
    const start = new Date().getTime();
    res.set("before-exec-timestamps", start);
    try {
        jres.data = await callback(req.body)
    } catch (error) {
        jres.error = 500;
        jres.message = error.message;
        jres.stack = error.stack;
        jres.errorName = error.name;
        console.error(error);
    }
    if (jres.data !== undefined) {
        const end = new Date().getTime();
        res.set("after-exec-timestamps", end);
        res.set('execution-time-ms', end - start);
        res.json(jres);
    }
}

// crud component
/**
 * 
 * @param {m.Model} schema 
 * @param {Number} level 
 * @param {Array} defSearch 
 * @param {Function} beforeSaveData 
 * @param {Object} sort 
 * @param {Function} beforeRead 
 * @param {Function} beforeSendResult 
 * @param {Object} defFilter
 * @returns {Router}
 */
export const createCrudController = (schema, level = 0, defSearch = [], projection = '', beforeSaveData = false, sort = { _id: -1 }, beforeRead = false,
    beforeSendResult = false, defFilter = {}) => {
    const rtr = Router();
    const { insert, reqPaging, update } = createModel(schema);

    rtr.get('/by/:id', (req, res) => {
        CtrlHandler(req, res, async () => {
            const { id } = req.params;
            return schema.findOne({ _id: id }, '', { lean: true });
        })
    });

    rtr.get('/all', (req, res) => {
        CtrlHandler(req, res, async () => {
            return await schema.find({}, projection);
        })
    })

    // get data
    rtr.get('/', (req, res) => {
        CtrlHandler(req, res, async () => {
            const { search, search2, page, perPage } = req.query;
            let filter = { ...defFilter };
            if (!!beforeRead && typeof beforeRead === 'function') {
                filter = await beforeRead(search, search2, filter)
            } else {
                if (!!search) {
                    const o = [];
                    const r = new RegExp(search, 'i');
                    for (let iii = 0; iii < defSearch.length; iii++) {
                        const f = defSearch[iii];
                        o.push({ [f]: r });
                    }
                    filter = { ...filter, $or: o };
                } else if (!!search2) {
                    const f = JSON.parse(search2);
                    filter = { ...filter, ...f };
                }
            }
            return await reqPaging(schema, page, perPage, filter, sort, projection)
        })
    })

    // add and update data
    rtr.post('/', (req, res) => {
        CtrlHandler(req, res, async (body) => {
            const { level: lvl, _id: uid } = res.locals.udata;
            let data = body;
            if (!!beforeSaveData && typeof beforeSaveData === 'function') {
                data = await beforeSaveData(data, lvl, uid, req);
            }
            if (level === 0 || ((level & lvl) > 0)) {
                const { _id } = data;
                if (!!_id) {
                    await update(data, _id)
                    return 'update success';
                }
                await insert(data, uid)
                return 'add success';
            }
            throw new Error('Error Privileges!');
        })
    })
    return rtr;
}


/**
 *  
 * @param {m.Model} schema 
 * @param {String} type 
 * @param {Array} columns 
 * @param {Function} getReport 
 * @returns {Router}
 */
export const createReportCtrl = (schema, type = 'daily', columns = [], getReport = false) => {
    const rtr = Router();
    const header = columns.map(({ title }) => title);
    const fields = columns.map(({ title, ...rest }) => ({ ...rest }));
    if (type === 'daily') {
        rtr.get('/:first_date/:last_date', (req, res) => {
            CtrlHandler(req, res, async (body) => {
                const { first_date, last_date } = req.params;
                if (typeof getReport === 'function') {
                    const data = await getReport(schema, req, res, first_date, last_date);
                    return { data, header, fields };
                }
                throw new Error("Report callback function not found!");
            })
        })
    }
    else {
        rtr.get('/:month', (req, res) => {
            CtrlHandler(req, res, async (body) => {
                const { month } = req.params;
                if (typeof getReport === 'function') {
                    const data = await getReport(schema, req, res, month);
                    return { data, header, fields };
                }
                throw new Error("Report callback function not found!");
            });
        })
    }

    return rtr;
}