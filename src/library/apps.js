let ENV = {};

export const setEnv = (env) => {
    ENV = { ...env };
}

export const getEnv = (params, def = '') => {
    return ENV[params] || def;
}