/**
 * Created by admin on 2017/2/9.
 */

import { createLogger, format, transports, config, Logger } from 'winston'
import { resolve } from 'path'
import { existsSync, mkdirSync } from 'fs'

class LogHelper {
  private _Logger: Logger

  constructor () {
    let LogPath = resolve(__dirname, '../logs')
    if (!existsSync(LogPath)) mkdirSync(LogPath)
    this._Logger = createLogger({
      levels: config.syslog.levels,
      transports: process.env.NODE_ENV === 'production' ? [
        new transports.File({filename: `${LogPath}/info.log`, level: 'info', maxsize: 1024 * 1024}),
        new transports.File({filename: `${LogPath}/error.log`, level: 'error', maxsize: 1024 * 1024})
      ] : [new transports.Console()],
      format: process.env.NODE_ENV === 'production' ? format.combine(format.timestamp(), format.prettyPrint()) : format.combine(format.simple(), format.splat())
    })
  }

  writeDebug (msg: string) {//输出debug信息
    if (msg == null) {
      msg = ''
    }
    this._Logger.log('debug', msg)
  }

  writeInfo (msg: string | Error | any) {//输出info信息
    if (msg == null) {
      msg = ''
    }
    this._Logger.log('info', msg)
  }

  writeWarn (msg: string) {//输出警告信息
    if (msg == null) {
      msg = ''
    }
    this._Logger.log('warn', msg)
  }

  writeErr (msg: string, exp?: string) {//输出错误信息
    if (msg == null) {
      msg = ''
    }
    if (exp != null) {
      msg += '\r\n' + exp
    }
    this._Logger.log('error', msg)
  }
}

export default new LogHelper()