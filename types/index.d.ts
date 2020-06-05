type DefaultEvents = 'RestartWorker'

interface RouteInfo {
  path: string
  routes?: Array<RouteInfo>
  exact?: boolean
  redirect?: string

  component?(): Promise<{ default: React.ComponentType }>
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    BUILD_TYPE: 'Master' | 'Client' | 'devClient' | 'devMaster'
    API_URL: string
  }
}

/**
 * API返回结果
 */
interface APIResult<O, R> {
  Method: string
  Options: O
  Result: R
  Error?: string
}

type EventList = DefaultEvents | MainEventList

type MainEventList = 'Main:SaveExam' | 'Main:LoadExam' | 'Main:CheckAnswer' | 'Main:LoadStandardAnswer' | 'Main:CheckStudentAnswers' | 'Main:CheckStudentAnswersProgress' | 'Main:ReviewAnswer'

interface ToClientMessage<O, R> {
  Method: string
  Options?: O
  Result?: R
}

interface BaseTestQuestion {
  Title: string
  Score: number
  Desc: string
}

interface TestQuestion extends BaseTestQuestion {
  Answers: Array<Answer>
}

interface TestQuestion2 extends BaseTestQuestion {
  Answer: string
}

interface BaseAnswer {
  Title: string
}

interface Answer extends BaseAnswer {
  Checked: boolean
}

interface SaveExamOptions {
  Path: string
  ExamName: string
  ExamDesc: string
  TestQuestions: Array<TestQuestion | TestQuestion2>
}

interface ExamInfo {
  Name: string
  TotalScore: number
  ExamDesc: string
  Questions: Array<TestQuestion | TestQuestion2>
}

interface ExamChecker {
  Score: number
  Check: string
}

interface CheckAnswer {
  Title: string
  Score: number
  Answer: Array<string>
}

interface CheckAnswerOptions {
  Answers: Array<string>
  Path: string
  UserName: string
  UserNum: string
}

interface ExamAnswer {
  ExamName: string
  ExamDesc: string
  TestQuestions: Array<TestQuestion | TestQuestion2>
  Answers: Array<string[]>
  TotalScore: number
  Score: number
  UserName: string
  UserNum: string
}
