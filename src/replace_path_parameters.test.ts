import {ReplacePathParameters} from './replace_path_parameters'

test('regex', ()=>{
    const sourceStr = 'a-b-c'

    const newSrc = sourceStr.replace(/([a-z])-([a-z])-([a-z])/, (matched, s1, s2, s3) => {
        return `${s1}-${s3}`
    })
    expect(newSrc).toBe("a-c")
})

test('repalce', ()=>{
    ReplacePathParameters("/Users/michael.mo/github.com/ufoundit-dev/uf-generate-cli/services/uf-tickets/apis/TicketsApi.ts")
})
