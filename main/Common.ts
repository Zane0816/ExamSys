import { createCipheriv, createDecipheriv, createHash } from 'crypto'
import BSON from 'bson'
import { readFileSync } from 'fs'

export const AESEncryption = (data: string, key: string, iv: string): string => {
  iv = iv || ''
  let cipherChunks = []
  const cipher = createCipheriv('aes-256-ecb', key, iv)
  cipher.setAutoPadding(true)
  cipherChunks.push(cipher.update(data, 'utf8', 'base64'))
  cipherChunks.push(cipher.final('base64'))
  return cipherChunks.join('')
}

export const AESDecryption = (data: string, key: string, iv: string): string => {
  if (!data) {
    return ''
  }
  iv = iv || ''
  let cipherChunks = []
  const decipher = createDecipheriv('aes-256-ecb', key, iv)
  decipher.setAutoPadding(true)
  cipherChunks.push(decipher.update(data, 'base64', 'utf8'))
  cipherChunks.push(decipher.final('utf8'))
  return cipherChunks.join('')
}

export const SHA256 = (data: string) => {
  return createHash('sha256').update(data).digest('base64')
}

export const Answer = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

export const GetRightValue = (answer: Array<Answer>): string[] => {
  const Right: string[] = []
  answer.forEach((d, i) => {
    if (d.Checked) {
      Right.push(Answer[i])
    }
  })
  return Right.sort()
}

export const ReviewAnswer = (Path: string): ExamAnswer => {
  const Exam: { ExamName: string; TestQuestions: Array<TestQuestion | TestQuestion2>; Answers: Array<string[]>; ExamDesc: string; UserName: string; UserNum: string } = BSON.deserialize(
    readFileSync(Path),
  )
  let Score: number = 0,
    TotalScore: number = 0
  Exam.TestQuestions.forEach((d, i) => {
    TotalScore += d.Score
    if ('Answers' in d) {
      if (Exam.Answers[i] && GetRightValue(d.Answers).join() === Exam.Answers[i].sort().join()) {
        Score += d.Score
      }
    }
  })
  return { ExamName: Exam.ExamName, Score, TestQuestions: Exam.TestQuestions, Answers: Exam.Answers, ExamDesc: Exam.ExamDesc, TotalScore, UserName: Exam.UserName, UserNum: Exam.UserNum }
}
