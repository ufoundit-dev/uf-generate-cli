import fs from 'fs';
import path from 'path';
import {Command} from 'commander';
import {Config} from './config';
import {Generator} from './generator';

const detectPaths = ['.', './config']

const detectConfig = (): string => {
    for ( const p in detectPaths ) {
        if ( fs.existsSync(path.join(p, "config.json")) ) {
            return path.join(p, "config.json")
        }
    }
    throw `can't find config.json in ${JSON.stringify(detectPaths)}`
}

const makeCommand = (): Command => {
    const cmd = new Command()
    cmd.option("-c, --config [path]", "indicate config file for uf-generate-cli")
    return cmd
}

interface Options {
    config?: string
}

const readConfig = (configFile : string):Config =>{
    const content = fs.readFileSync(configFile, 'utf8')
    return JSON.parse(content) as Config
}

const main = () => {
    let cmd = makeCommand()
    cmd.parse(process.argv)
    let opts = cmd.opts<Options>()
    if ( !opts.config ) {
        opts.config = detectConfig()
    }

    const cfg = readConfig(opts.config)

    const g = new Generator(cfg)

    g.generate()

    console.log("Success to generate!!!!!!!!!!!!!!!!!!!")
}

main()


