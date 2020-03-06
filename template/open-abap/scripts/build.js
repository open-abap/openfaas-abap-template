
const klaw = require('klaw')
const through2 = require('through2')
const path = require('path')
const fs = require('fs-extra')
const Transpiler = new require('@abaplint/transpiler').Transpiler

const SOURCE_DIR = 'function'
const BUILD_DIR = 'build'

const transpiler = new Transpiler()
const abapToJs = async function (abapFile) {
    /* this is hackery: function modules and their signature are not supported
    in ABAPLint and/or the transpiler yet.
    In order to have a FUNCTION module handler, we need to add the signature to the 
    ABAP code (so that the linter and the transpiler are happy)
    and inject code lateron which passes the values to the handler
    */

    const mockFunctionTranspilation = function (abapSourceString) {
        // add signature from comments (d'oh, this hurts! - please, Lars, transpile classes and interfaces soon!)
        const abapSignatureLinesImporting = abapSourceString
            .split('EXPORTING')[0]
            .split(/\r?\n/)
            .filter(l => l.match(/^\*.*TYPE/))
        const abapSignatureLinesExporting = abapSourceString
            .split('EXPORTING')[1]
            .split(/\r?\n/)
            .filter(l => l.match(/^\*.*TYPE/))

        const abapSignatureLines = []
            .concat(abapSignatureLinesImporting)
            .concat(abapSignatureLinesExporting)

        abapSourceString =
            abapSignatureLines
                .map(l => l.replace(/^\*"\s*/, 'DATA ') + '.')
                .join('\n')
            + abapSourceString

        let transpiledSource = transpiler.run(abapSourceString)

        // inject variable initialization
        if (abapSignatureLines && abapSignatureLines.length) {
            transpiledSourceArray = transpiledSource.split(/\r?\n/)
            transpiledSourceArray.splice(abapSignatureLines.length, 0,
                ...(abapSignatureLinesImporting.map(l => l.replace(/^\*"\s*(\w*).*/, '$1.set(input.$1);')))
            ) //splice does not return a new array but manipulates the array instance!
            transpiledSource = transpiledSourceArray.join('\n')
        }

        // finally, add the function wrapper
        const FUNCTION_SETUP = 'module.exports = async function(input){'
            + '\n// Generated code - do not edit\n'

        return FUNCTION_SETUP
            + transpiledSource
                .replace('todo, statement: FunctionModule', '')
                .replace('todo, statement: EndFunction', 'return {result: output.get(), code: code.get()}\n}')
    }

    let abapSourceString = (await fs.readFile(abapFile)).toString()

    let transpiledSource = ''

    if (abapFile.match(/.*handler.abap$/)) {
        // wrap the whole function module into a function
        transpiledSource = mockFunctionTranspilation(abapSourceString)
    } else {
        transpiledSource = transpiler.run(abapSourceString)
    }

    // Add the JS imports
    transpiledSource = 'const abap = require("@abaplint/runtime")\n'
        + transpiledSource

    // strip comments
    return transpiledSource
        .replace(/todo, statement: Comment\s?/g, '')
}

const run = async function () {
    try {
        await fs.emptyDir(BUILD_DIR)
        await fs.rmdir(BUILD_DIR)
    } catch (e) {
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