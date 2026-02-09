import * as core from "@actions/core";
import fs from "node:fs";
import yaml from "js-yaml";

export function parseConfig() {
  const configFile = core.getInput("configuration-file");
  const config = yaml.load(fs.readFileSync(configFile, "utf-8"));
  return config;
}
