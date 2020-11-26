const core = require("@actions/core");
const fs = require("fs");
const yaml = require("js-yaml");

exports.parseConfig = function () {
    const configFile = core.getInput("configuration_file");
    const config = yaml.safeLoad(fs.readFileSync(configFile, "utf-8"));
    return config;
}
