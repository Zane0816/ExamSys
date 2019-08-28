import { ipcRenderer, remote } from 'electron'
import AppStore from './AppStore'
import { message } from 'antd'

const EventList: Array<EventList> = remote.getGlobal('EventList')

export default class IPCConnect {
  constructor () {
    this.EventInit()
  }

  /**
   * 调用底层方法
   * @param Channel 方法调用路径
   * @param Args 调用参数
   */
  IPCRender (Channel: 'Main:SaveExam', Args: SaveExamOptions): void
  IPCRender (Channel: 'Main:LoadExam' | 'Main:LoadStandardAnswer' | 'Main:ReviewAnswer', Args: string): void
  IPCRender (Channel: 'Main:CheckAnswer', Args: CheckAnswerOptions): void
  IPCRender (Channel: 'Main:CheckStudentAnswers', Args: Array<string>): void
  IPCRender (Channel: EventList, Args?: any): void {
    if (EventList.includes(Channel)) {
      console.log(Channel, Args)
      ipcRenderer.send(Channel, Args)
    } else throw new Error('方法不存在')
  }

  /**
   * 初始化响应后端数据事件
   */
  EventInit () {
    EventList.forEach((e: EventList) => {
      ipcRenderer.on(e, (ev: Event, data: APIResult<any, any>) => {
        if (data.Error) console.error(data)
        switch (e) {
          case 'Main:SaveExam':
            message.success('保存成功!')
            break
          case 'Main:LoadExam':
            this.LoadExamResult(data)
            break
          case 'Main:CheckAnswer':
            this.CheckAnswerResult(data)
            break
          case 'Main:LoadStandardAnswer':
            // AppStore.LoadedStandardAnswer = true
            break
          case 'Main:CheckStudentAnswersProgress':
            this.CheckStudentAnswersResult(data)
            break
          case 'Main:ReviewAnswer':
            this.ReviewAnswerResult(data)
            break
        }
      })
    })
  }

  LoadExamResult (Data: APIResult<string, ExamInfo>) {
    console.log(Data)
    if (Data.Error) {
      message.warn('提取试卷出错!')
    } else {
      AppStore.ExamInfo = Data.Result
      AppStore.ExamStatus = 1
    }
  }

  CheckAnswerResult (Data: APIResult<{}, number>) {
    AppStore.CheckedExam = true
  }

  CheckStudentAnswersResult (Data: APIResult<string, { Score: number, ErrorQuestionNum: string[] }>) {
    console.log(Data)
    AppStore.ExamCheckResult.push(Object.assign({ UserName: Data.Options }, Data.Result))
  }

  ReviewAnswerResult (Data: APIResult<{}, ExamAnswer>) {
    console.log(Data.Result)
    if (Data.Error) {
      message.warn('提取试卷出错!')
    } else {
      AppStore.ExamAnswer = Data.Result
      AppStore.ExamStatus = 2
    }
  }
}
