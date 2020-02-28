const copyDir = require('./fileUtils').copyDir

const SOURCE_DIR = 'function'
const BUILD_DIR = 'build'

copyDir(SOURCE_DIR, BUILD_DIR)