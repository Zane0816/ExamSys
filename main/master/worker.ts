import LogHelper from '../LogHelper'
import ElectronModule from '../ElectronModule'
import BSON from 'bson'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { GetRightValue, ReviewAnswer } from '../Common'
import { basename, resolve } from 'path'
import { exec } from 'child_process'

class Index extends ElectronModule {
  private _CheckAnswers?: Array<ExamChecker>

  constructor() {
    super('Main')
    try {
    } catch (err) {
      LogHelper.writeErr(err)
      throw err
    }
    this.SendMessage({ Method: 'AppInit' })
  }

  SaveExam({ Path, ExamName, TestQuestions, ExamDesc }: SaveExamOptions) {
    // const Exam: Array<TestQuestionDB> = []
    // const ExamCheckers: Array<ExamChecker> = []
    /*  TestQuestions.forEach((d) => {
        let Right: Array<string> = []
        let Answers: Array<string> = []
        d.Answers.forEach((ad, i) => {
          Answers.push(ad.Title)
          if (ad.Checked) {
            Right.push(this.Answer[i])
          }
        })
        // const Check = SHA256(d.Title + Right.join() + d.Score)
        // Exam.push({ Title: d.Title, Score: d.Score, Answers, Desc: d.Desc })
        // ExamCheckers.push({ Score: d.Score, Check })
      })*/
    // mkdirSync(resolve(Path, ExamName))
    writeFileSync(resolve(Path, `${ExamName}.exam`), BSON.serialize({ ExamName, ExamDesc, TestQuestions }))
    //writeFileSync(resolve(Path, ExamName, `${ExamName}.check`), key.encryptPrivate(BSON.serialize(ExamCheckers)))
    exec(`start "" "${Path}"`)
  }

  LoadExam(Path: string): ExamInfo {
    const Exam = BSON.deserialize(readFileSync(Path))
    let TotalScore = 0
    Exam.TestQuestions.forEach((d: TestQuestion) => {
      TotalScore += d.Score
    })
    return { Name: basename(Path).replace('.exam', ''), TotalScore, Questions: Exam.TestQuestions, ExamDesc: Exam.ExamDesc }
  }

  LoadStandardAnswer(Path: string) {
    //     const key = new NodeRSA(`-----BEGIN PUBLIC KEY-----
    // MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAIbzcSrKUMWAYTYAPklksWG8clgzHbUj
    // KUGWkFIQxm7FzcMdQWZRYeFRwNvpsblBQk8UYBINoMThwfLTaENBftUCAwEAAQ==
    // -----END PUBLIC KEY-----`)
    //     this._CheckAnswers = BSON.deserialize(readFileSync(Path))
  }

  CheckStudentAnswers(Path: Array<string>) {
    Path.forEach((d) => {
      let Score: number = 0
      let ErrorQuestionNum: Array<number> = []
      const Exam: { TestQuestions: Array<TestQuestion | TestQuestion2>; Answers: Array<string> } = BSON.deserialize(readFileSync(d))
      Exam.TestQuestions.forEach((d, i) => {
        if ('Answers' in d && GetRightValue(d.Answers).join() === Exam.Answers[i]) {
          Score += d.Score
          ErrorQuestionNum.push(i + 1)
        }
      })
      this.SendMessage({
        Method: 'Main:CheckStudentAnswersProgress',
        Options: basename(d).replace('.answer', ''),
        Result: { Score, ErrorQuestionNum },
      })
    })
  }

  ReviewAnswer = ReviewAnswer
}

new Index()
