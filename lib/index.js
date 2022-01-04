"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const commander_1 = require("commander");
const generator_1 = require("./generator");
const detectPaths = ['.', './config'];
const detectConfig = () => {
    for (const p in detectPaths) {
        if (fs_1.default.existsSync(path_1.default.join(p, "config.json"))) {
            return path_1.default.join(p, "config.json");
        }
    }
    throw `can't find config.json in ${JSON.stringify(detectPaths)}`;
};
const makeCommand = () => {
    const cmd = new commander_1.Command();
    cmd.option("-c, --config [path]", "indicate config file for uf-generate-cli");
    return cmd;
};
const readConfig = (configFile) => {
    const content = fs_1.default.readFileSync(configFile, 'utf8');
    return JSON.parse(content);
};
const main = () => {
    let cmd = makeCommand();
    cmd.parse(process.argv);
    let opts = cmd.opts();
    if (!opts.config) {
        opts.config = detectConfig();
    }
    const cfg = readConfig(opts.config);
    const g = new generator_1.Generator(cfg);
    g.generate();
    console.log("Success to generate!!!!!!!!!!!!!!!!!!!");
};
main();
//# sourceMappingURL=index.js.map