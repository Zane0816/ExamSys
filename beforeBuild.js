const IsBuildMaster = process.env.BUILD_TYPE.includes('Master')//是否构建主考端
const IsBuildClient = process.env.BUILD_TYPE.includes('Client')//是否构建考试端

function pack (configuration) {
  return new Promise((res, reject) => {
    let pkg = require('./package.json')
    const fs = require('fs')
    const { resolve } = require('path')
    const { execSync } = require('child_process')
    delete pkg.scripts //移除运行脚本
    delete pkg.devDependencies//移除开发所需组件
    delete pkg.repository
    if (IsBuildMaster) {
      pkg.name += '-m'
      pkg.productName += '--主考端'
      pkg.description += '--主考端'
    }
    if (IsBuildClient) {
      pkg.name += '-c'
      pkg.productName += '--考生端'
      pkg.description += '--考生端'
    }
    pkg.main = 'main.js'//修改入口文件
    fs.writeFile(resolve(__dirname, 'dist/package.json'), JSON.stringify(pkg), (err) => {//写入配置文件
      if (!err) {
        console.log('writeDone')
        // execSync('yarn')
      }
      res(true)
    })
  })
}

pack()