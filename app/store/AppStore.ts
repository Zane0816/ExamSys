import { observable } from 'mobx'

class AppStore {
  constructor () {}

  @observable ExamInfo?: ExamInfo
  @observable ExamStatus: 0 | 1 | 2 = 0
  @observable ExamAnswerScore: number = 0
  // @observable LoadedStandardAnswer: boolean = false
  @observable ExamCheckResult: Array<{ UserName: string, Score: number, ErrorQuestionNum: string[] }> = []
  @observable CheckedExam: boolean = false
  @observable ExamAnswer?: ExamAnswer
}

export default new AppStore()

