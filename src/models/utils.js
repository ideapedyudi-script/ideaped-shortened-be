import m from 'mongoose';

// component get data
export const reqPaging = async (schema, page, perPage, filter = {}, sort = { _id: -1 }, projection = '') => {
    const offset = (page - 1) * perPage;
    const data = await schema.find(filter, projection, { skip: parseInt(offset), limit: parseInt(perPage) });
    const total = await schema.countDocuments(filter);
    return { data, total };
}

// component add and update
export const createModel = (schema) => {
    const insert = async (body, uid) => {
        const result = await schema.create({ ...body, createdBy: m.Types.ObjectId(uid) });
        return result;
    }

    const update = async (body, id) => {
        return await schema.findOneAndUpdate({ _id: m.Types.ObjectId(id) }, { $set: { ...body } });
    }

    return { insert, update, reqPaging };
}