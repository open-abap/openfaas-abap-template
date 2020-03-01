
const klaw = require('klaw')
const through2 = require('through2')
const path = require('path')
const fs = require('fs-extra')
const Transpiler = new require('@abaplint/transpiler').Transpiler

const SOURCE_DIR = 'function'
const BUILD_DIR = 'build'

const transpiler = new Transpiler()
const abapToJs = async function (abapFile){
    let transpiledSource = transpiler.run((await (await fs.readFile(abapFile)).toString()))
    transpiledSource = 'const abap = require("@abaplint/runtime")'
                        + '\n'
                        + transpiledSource
    if(abapFile.match(/.*handler.abap$/)){
        return mockFunctionTranspilation(transpiledSource)
    }
    return transpiledSource
}

const mockFunctionTranspilation = function (source){
    return source
        .replace('todo, statement: FunctionModule', 'module.exports = async function(input){\n// Generated code - do not edit\nlet output = new abap.types.String();')
        .replace(/todo, statement: Comment\s?/g, '', )
        .replace('todo, statement: EndFunction', 'return output.get()\n}')
}

const run = async function () {
    try {
        await fs.emptyDir(BUILD_DIR)
        await fs.rmdir(BUILD_DIR)
    } catch(e){
        // expected: build dir might not exist
    }

    await fs.ensureDir(BUILD_DIR)

    const filterAbapFiles = through2.obj(function (item, enc, next) {
        if (path.extname(item.path) === '.abap') {
            this.push(item)
        }
        next()
    })

    const abapFiles = [] // files, directories, symlinks, etc
    klaw(SOURCE_DIR)
        .on('error', err => filterAbapFiles.emit('error', err)) // forward the error on
        .pipe(filterAbapFiles)
        .on('data', item => abapFiles.push(item.path))
        .on('end', () => {
            abapFiles.forEach(async (file) => {
                const source = await abapToJs(file)
                const outFile = file.replace(new RegExp(`^${process.cwd()}/${SOURCE_DIR}(.*)\.abap$`), `${process.cwd()}/${BUILD_DIR}$1.js`)
                await fs.ensureFile(outFile)
                await fs.writeFile(outFile, source)
            })
        })
}


run()