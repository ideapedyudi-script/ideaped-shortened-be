import Joi from 'joi';

export const vdtShortened = async (body) => {
    const schema = Joi.object({
        redirect_uri: Joi.string().uri().required(),
    }).unknown(true);

    const { error } = schema.validate(body)
    if (error) {
        throw new Error('invalid url');
    }
}