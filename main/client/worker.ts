import LogHelper from '../LogHelper'
import ElectronModule from '../ElectronModule'
import BSON from 'bson'
import { readFileSync, writeFileSync } from 'fs'
import { basename, dirname, resolve } from 'path'
import { exec } from 'child_process'
import { ReviewAnswer } from '../Common'

class Index extends ElectronModule {
  constructor() {
    super('Main')
    try {
    } catch (err) {
      LogHelper.writeErr(err)
      throw err
    }
    process.send && process.send({ Method: 'AppInit' })
  }

  Answer = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  LoadExam(Path: string): ExamInfo {
    const Exam = BSON.deserialize(readFileSync(Path))
    let TotalScore = 0
    Exam.TestQuestions.forEach((d: TestQuestion) => {
      TotalScore += d.Score
    })
    return { Name: basename(Path).replace('.exam', ''), TotalScore, Questions: Exam.TestQuestions, ExamDesc: Exam.ExamDesc }
  }

  CheckAnswer({ Path, UserName, UserNum, Answers }: CheckAnswerOptions) {
    const DirPath = dirname(Path)
    const Exam = BSON.deserialize(readFileSync(Path))
    Exam.Answers = Answers
    Exam.UserName = UserName
    Exam.UserNum = UserNum
    console.log(Exam)
    writeFileSync(resolve(DirPath, `${UserName}-${UserNum}.answer`), BSON.serialize(Exam))
    exec(`start "" "${DirPath}"`)
  }

  ReviewAnswer = ReviewAnswer
}

new Index()
