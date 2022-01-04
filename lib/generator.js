"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generator = void 0;
const path_1 = __importDefault(require("path"));
const os = __importStar(require("os"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = __importDefault(require("child_process"));
class Generator {
    constructor(cfg) {
        this.workDir = '';
        this.config = cfg;
    }
    clean() {
        if (this.workDir.length > 0) {
            fs_1.default.rmSync(this.workDir, { recursive: true });
            this.workDir = '';
        }
    }
    prepareScript() {
        let output = '#!/usr/bin/env bash\n\n';
        for (const c of this.config.openAPI) {
            const inputFilename = path_1.default.basename(c.schemaPath);
            var args = '';
            for (const a in c.args) {
                args += `${a} ${c.args[a]} `;
            }
            var additionalProperties = '';
            for (const a in c.additionalProperties) {
                additionalProperties += `--additional-properties=${a}=${c.additionalProperties[a]} `;
            }
            output += `/usr/local/bin/docker-entrypoint.sh generate ${args.trimRight()} ${additionalProperties.trimRight()} -i=/data/input/${c.projectName}/${inputFilename} -o /data/output/${c.projectName}\n`;
        }
        fs_1.default.writeFileSync(`${this.workDir}/g.sh`, output, { flag: 'w', mode: 0o700 });
        console.log(output);
    }
    makeSource() {
        this.workDir = fs_1.default.mkdtempSync(path_1.default.join(os.tmpdir(), "uf-generate-cli"));
        fs_1.default.mkdirSync(path_1.default.join(this.workDir, "input"));
        fs_1.default.mkdirSync(path_1.default.join(this.workDir, "output"));
        for (const c of this.config.openAPI) {
            fs_1.default.mkdirSync(path_1.default.join(this.workDir, "input", c.projectName));
            fs_1.default.mkdirSync(path_1.default.join(this.workDir, "output", c.projectName));
            const inputFilename = path_1.default.basename(c.schemaPath);
            fs_1.default.copyFileSync(c.schemaPath, `${this.workDir}/input/${c.projectName}/${inputFilename}`);
        }
    }
    makeResult() {
        for (const c of this.config.openAPI) {
            const outputDir = path_1.default.join(this.config.outputDir, c.projectName);
            if (fs_1.default.existsSync(outputDir)) {
                if (this.config.backupOld) {
                    const now = new Date();
                    fs_1.default.renameSync(outputDir, path_1.default.join(`${outputDir}-${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`));
                }
                else {
                    fs_1.default.rmSync(outputDir, { recursive: true });
                }
            }
            fs_1.default.mkdirSync(outputDir, { recursive: true });
            child_process_1.default.execSync(`cp -r ${path_1.default.join(this.workDir, "output", c.projectName)} ${outputDir}`);
        }
    }
    generate() {
        // make temp dir as workdir
        this.makeSource();
        console.log(`workDir is ${this.workDir}`);
        // make build script
        this.prepareScript();
        // run docker
        let cmd = `docker run --rm -v "${this.workDir}:/data" --entrypoint "/data/g.sh" openapitools/openapi-generator-cli:latest`;
        child_process_1.default.execSync(cmd);
        // copy file to target
        this.makeResult();
        // final clean
        this.clean();
    }
}
exports.Generator = Generator;
exports.default = Generator;
//# sourceMappingURL=generator.js.map