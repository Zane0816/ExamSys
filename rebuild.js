/**
 * Created by admin on 2017/3/27.
 */
const { execSync } = require('child_process')
const { existsSync } = require('fs')
const { resolve } = require('path')

const pkg = require('./package.json')
for (let k in pkg.dependencies) {
  let WorkPath = resolve(__dirname, 'node_modules', k)
  if (existsSync(resolve(WorkPath, 'binding.gyp'))) {
    let CMDStr = `node-gyp rebuild --arch=ia32 --target=${pkg.devDependencies.electron} --dist-url=https://atom.io/download/electron`
    execSync(CMDStr, { cwd: WorkPath, stdio: [0, 1, 2] })
  }
}