import * as core from "@actions/core";
import fs from "node:fs";
import { load } from "js-yaml";

export function parseConfig() {
  const configFile = core.getInput("configuration-file");
  const config = load(fs.readFileSync(configFile, "utf-8"));
  return config;
}
