const core = require("@actions/core");
const fs = require("fs");
const yaml = require("js-yaml");

exports.parseConfig = function () {
  const configFile = core.getInput("configuration-file");
  const config = yaml.load(fs.readFileSync(configFile, "utf-8"));
  return config;
};
