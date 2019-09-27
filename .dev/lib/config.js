const fs = require('fs');

const configPath = './.dev/deploy.json';

class Config {
    constructor() {
        this.__config = null;
    }

    get() {
        if (this.__config === null) {
            this.read();
        }

        return this.__config;
    }

    read() {
        let config = fs.readFileSync(configPath);

        if (!config) {
            throw new Error(`Config file missed on path "${configPath}"`);
        }

        try {
            this.__config = JSON.parse(config);
        } catch (err) {
            throw new Error(`Wrong config file "${configPath}" format: ${err.message}`);
        }
    }
}

module.exports = new Config();
