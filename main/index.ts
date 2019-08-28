import { app, BrowserWindow, ipcMain, screen, Menu } from 'electron'
import { watchFile } from 'fs'
import { resolve } from 'path'
import { ChildProcess, fork } from 'child_process'
import { format } from 'url'
import LogHelper from './LogHelper'

let MainWindow: BrowserWindow, worker: ChildProcess//声明主窗体
const WinUrl = process.env.NODE_ENV === 'production' ? format({
    pathname: resolve(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }) : `http://localhost:9006/`,
  WorkerPath = resolve(__dirname, 'worker.js')

// RestartWorker()//启动进程

/**
 * 创建窗体
 * @constructor
 */
function CreateWindow () {
  Menu.setApplicationMenu(null)
  const { width, height } = screen.getPrimaryDisplay().workAreaSize//获取屏幕工作区
  MainWindow = new BrowserWindow({//创建主窗体
    width: 1204,
    height: 768,
    minWidth: 1204,
    minHeight: 768,
    frame: false,
    center: true,
    webPreferences: { webSecurity: false, nativeWindowOpen: true, nodeIntegration: true }
  })
  MainWindow.loadURL(WinUrl)//加载页面
  MainWindow.on('closed', () => {//监听窗体关闭事件
    // MainWindow.close()//清空窗体
    app.quit()//退出程序
  })
  MainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures) => {
    // open window as modal
    event.preventDefault()
    Object.assign(options, {
      width: 800,
      height: 600,
      minWidth: 800,
      minHeight: 600,
      frame: true,
      center: true,
      x: (width - 800) / 2,
      y: (height - 600) / 2,
      webPreferences: { webSecurity: true, nodeIntegration: false }
    })
    // @ts-ignore
    event.newGuest = new BrowserWindow(options)
    // @ts-ignore
    process.env.NODE_ENV !== 'production' && event.newGuest.webContents.openDevTools()
  })
  process.env.NODE_ENV !== 'production' && MainWindow.webContents.openDevTools()//开发模式下默认打开调试窗口
}

app.setPath('userData', resolve(__dirname, `${process.env.NODE_ENV === 'production' ? '' : '.'}./userData`))
app.on('ready', RestartWorker)//程序准备完毕,加载窗口
app.on('window-all-closed', () => {//当所有窗口关闭,退出程序
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

declare const global: {
  EventList: Array<EventList>
}

global.EventList = ['RestartWorker', 'Main:SaveExam', 'Main:LoadExam', 'Main:CheckAnswer', 'Main:LoadStandardAnswer', 'Main:CheckStudentAnswers', 'Main:CheckStudentAnswersProgress', 'Main:ReviewAnswer']

/**
 * 遍历注册事件
 */
global.EventList.forEach((d) => {
  ipcMain.on(d, async (e: Error, opt: any) => {
    if (process.env.NODE_ENV !== 'production') LogHelper.writeInfo(`${d} : ${JSON.stringify(opt)}`)
    else {
      if (d.includes('SaveExam')) {
        LogHelper.writeInfo(`${d} : ${JSON.stringify({ Path: opt.Path })}`)
      }
    }

    try {
      if (d === 'RestartWorker') {//重启进程事件
        RestartWorker()
      } else {
        worker.send({ Method: d, Options: opt })
      }
    } catch (err) {
      LogHelper.writeErr(err)
    }
  })
})

/**
 *  重启底层进程
 */
function RestartWorker () {
  LogHelper.writeInfo(`Worker is restarting`)
  worker = fork(WorkerPath, [], { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] })
  worker.on('message', (Result) => {
    LogHelper.writeInfo(`Worker Run ${Result.Method} : ${Result.Data}`)
    if (Result.Method === 'AppInit') {
      CreateWindow()
    } else if (Result.Method === 'AppQuit') {
      app.quit()
      worker.kill()
    } else {
      MainWindow.webContents.send(`${Result.Method}`, Result)
    }
  })
  worker.on('exit', (code) => {//当进程退出
    // console.log(`Worker is exit`)
    LogHelper.writeInfo(`Worker is exit with ${code}`)
    MainWindow.webContents.send(`RestartWorker`, 'WorkerExit')
  })
  worker.on('uncaughtException', (err) => {//捕获进程未捕获的异常
    LogHelper.writeErr(err)
  })
  worker.on('error', (err) => {//当进程出错
    LogHelper.writeErr(err.message)
  })
  // console.info('Worker is restarted')
  LogHelper.writeInfo(`Worker is restarted`)
  if (MainWindow) MainWindow.webContents.send(`RestartWorker`, 'WorkerRestarted')//当界面已存在,则向UI层发送重启消息
}

if (process.env.NODE_ENV !== 'production') {
  watchFile(WorkerPath, () => {
    console.info('Worker is changed')
    worker.disconnect()
  })
}