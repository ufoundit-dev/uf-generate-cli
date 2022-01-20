import fs from "fs";

export const ReplacePathParameters = (filename: string) => {
    const buf = fs.readFileSync(filename, {encoding: "utf8"})
    const regex = /([ \t]*path: `[/][^{]*{[^=]+)(=[^}]+)(}.*)(encodeURIComponent[(])(.*)([)],)/g
    let changeCount = 0
    const newbuf = buf.replace(regex, ( substring: string, ...submatch: any[]) => {
        changeCount++
        return `${submatch[0]}${submatch[2]}${submatch[4]},`
    })


    if ( changeCount > 0 ) {
        console.log(`${filename} change ${changeCount} line`)
    }

    fs.writeFileSync(filename, newbuf)
}

