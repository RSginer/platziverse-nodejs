
let configEnv

if (process.env.NODE_ENV) {
    const configEnv = require(`./config.${process.env.NODE_ENV}.js`);
}

const configCommon = require(`./default/config.js`);

const config = Object.assign(configCommon, configEnv ? configEnv : {});

module.exports = config;