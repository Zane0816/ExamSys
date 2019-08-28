import IPCConnect from './IPCConnect'

/**
 * 文件大小转文本
 * @param Size 文件大小\
 */
export function FileSizeToString (Size: number): string {
  if (Size < 1024) {
    return `${Size}Byte`
  } else if (Size > 1024 && Size < 1024 * 1024) {
    return `${(Size / 1024).toFixed(2)}KB`
  } else if (Size > 1024 * 1024 && Size < 1024 * 1024 * 1024) {
    return `${(Size / 1024 / 1024).toFixed(2)}MB`
  } else {
    return `${(Size / 1024 / 1024 / 1024).toFixed(2)}GB`
  }
}

/**
 * 将毫秒时间转换成描述文本
 * @param Time 时间
 * @return {string} 描述文本
 */
export function TimeToText (Time: number): string {
  let H, HT, M, MT, S, L
  H = Math.floor(Time / 1000 / 60 / 60)
  HT = H > 0 ? `${H}小时` : ''
  L = Time - H * 1000 * 60 * 60
  M = Math.floor(L / 60 / 1000)
  MT = M > 0 ? `${M}分钟` : ''
  L = L - M * 60 * 1000
  S = L / 1000
  return `${HT}${MT}${S.toFixed()}秒`
}

export const IPCRender = new IPCConnect().IPCRender
