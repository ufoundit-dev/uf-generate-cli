export interface Arguments {
    [id : string]: string
}

export interface AdditionalProperties {
    [id : string]: string
}

export interface OpenAPI {
    schemaPath: string
    projectName: string
    args?: Arguments
    additionalProperties ?: AdditionalProperties
}

export interface Config {
    outputDir: string
    backupOld?: boolean
    openAPI: Array<OpenAPI>
}
