import {Config} from './config'
import path from "path";
import * as os from "os";
import fs, {constants as fs_constants} from "fs";
import child_process from 'child_process';

export class Generator {
    private config: Config
    private workDir: string = ''

    constructor(cfg: Config) {
        this.config = cfg
    }

    clean() {
        if (this.workDir.length > 0) {
            fs.rmSync(this.workDir, {recursive: true})
            this.workDir = ''
        }
    }

    prepareScript() {
        let output = '#!/usr/bin/env bash\n\n'

        for (const c of this.config.openAPI) {
            const inputFilename = path.basename(c.schemaPath)
            var args: string = ''
            for (const a in c.args) {
                args += `${a} ${c.args[a]} `
            }

            var additionalProperties: string = ''
            for (const a in c.additionalProperties) {
                additionalProperties += `--additional-properties=${a}=${c.additionalProperties[a]} `
            }

            output += `/usr/local/bin/docker-entrypoint.sh generate ${args.trimRight()} ${additionalProperties.trimRight()} -i=/data/input/${c.projectName}/${inputFilename} -o /data/output/${c.projectName}\n`
        }

        fs.writeFileSync(`${this.workDir}/g.sh`, output, {flag: 'w', mode: 0o700})
        console.log(output)
    }

    makeSource() {
        this.workDir = fs.mkdtempSync(path.join(os.tmpdir(), "uf-generate-cli"))
        fs.mkdirSync(path.join(this.workDir, "input"))
        fs.mkdirSync(path.join(this.workDir, "output"))
        for (const c of this.config.openAPI) {
            fs.mkdirSync(path.join(this.workDir, "input", c.projectName))
            fs.mkdirSync(path.join(this.workDir, "output", c.projectName))

            const inputFilename = path.basename(c.schemaPath)
            fs.copyFileSync(c.schemaPath, `${this.workDir}/input/${c.projectName}/${inputFilename}`)
        }
    }

    makeResult() {
        for (const c of this.config.openAPI) {
            const outputDir = path.join(this.config.outputDir, c.projectName)
            if (fs.existsSync(outputDir)) {
                if (this.config.backupOld) {
                    const now = new Date()
                    fs.renameSync(outputDir, path.join(`${outputDir}-${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`))
                } else {
                    fs.rmSync(outputDir, {recursive: true})
                }
            }

            fs.mkdirSync(outputDir, {recursive: true})
            child_process.execSync(`cp -r ${path.join(this.workDir, "output", c.projectName)} ${outputDir}`)
        }
    }

    generate() {
        // make temp dir as workdir
        this.makeSource()

        console.log(`workDir is ${this.workDir}`)

        // make build script
        this.prepareScript()

        // run docker
        let cmd = `docker run --rm -v "${this.workDir}:/data" --entrypoint "/data/g.sh" openapitools/openapi-generator-cli:latest`

        child_process.execSync(cmd)

        // copy file to target
        this.makeResult()

        // final clean
        this.clean()
    }
}

export default Generator
