import React, { Fragment } from 'react'
import { hot } from 'react-hot-loader/root'
import { observer } from 'mobx-react'
import { observable, reaction, toJS } from 'mobx'
import { remote } from 'electron'
import { IPCRender } from '../store/Commons'
import { Button, Checkbox, Form, Icon, Input, InputNumber, Modal } from 'antd'
import { FormComponentProps } from 'antd/es/form'
import AppStore from '../store/AppStore'
import { Answer, GetRightValue } from '../../main/Common'
import { existsSync } from 'fs'
import { resolve } from 'path'

type CreateExamProps = {
  ReCreate (): void
} & Partial<CreateExamDefaultProps> & FormComponentProps
type CreateExamDefaultProps = {}

@hot
@observer
class CreateExam extends React.Component<CreateExamProps> {
  static defaultProps: CreateExamDefaultProps = {}

  constructor (props: Readonly<CreateExamProps>) {
    super(props)
  }

  @observable TestQuestions: Array<TestQuestion> = []
  ExamInfoChange?: Function

  componentDidMount (): void {
    this.ExamInfoChange = reaction(() => AppStore.ExamInfo, (ExamInfo: ExamInfo) => {
      const { setFieldsValue, resetFields } = this.props.form
      resetFields()
      setFieldsValue({ ExamName: ExamInfo.Name, ExamDesc: ExamInfo.ExamDesc })
      // const TestQuestions: Array<TestQuestion> = []
      // ExamInfo.Questions.forEach((d) => {
      //   TestQuestions.push({ Title: d.Title, Score: d.Score, Desc: d.Desc, Answers:d.Answers })
      // })
      this.TestQuestions = ExamInfo.Questions
    })
  }

  componentWillUnmount (): void {
    this.ExamInfoChange && this.ExamInfoChange()
  }

  get TotalScore (): number {
    const values = this.props.form.getFieldsValue()
    let score = 0
    for (let key in values) {
      if (key.startsWith('Score')) {
        score += values[key]
      }
    }
    return score
  }

  AddQuestion () {
    this.TestQuestions.push({ Title: '', Score: 2, Desc: '', Answers: [{ Title: '', Checked: false }] })
  }

  RemoveQuestion (i: number) {
    this.TestQuestions.splice(i, 1)
  }

  AddQuestionAnswer (qi: number) {
    this.TestQuestions[qi].Answers.push({ Title: '', Checked: false })
  }

  RemoveQuestionAnswer (qi: number, i: number) {
    this.TestQuestions[qi].Answers.splice(i, 1)
  }

  CreateExam () {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        remote.dialog.showOpenDialog({
            title: '选择目标文件地址',
            properties: ['openDirectory'],
          }, (FilePaths) => {
            if (FilePaths) {
              if (existsSync(resolve(FilePaths[0], `${values.ExamName}.exam`))) {
                Modal.confirm({
                  title: '试卷文件已存在！', content: '是否覆盖？', onOk: () => {
                    this.SaveExam(FilePaths[0], values)
                  }
                })
              } else {
                this.SaveExam(FilePaths[0], values)
              }
            }
          }
        )
      }
    })
  }

  SaveExam (Path: string, values: { [key: string]: any }) {
    for (let key in values) {
      if (key.startsWith('Question')) {
        const index = parseInt(key.replace('Question', ''))
        this.TestQuestions[index].Title = values[key]
        continue
      }
      if (key.startsWith('Score')) {
        const index = parseInt(key.replace('Score', ''))
        this.TestQuestions[index].Score = values[key]
        continue
      }
      if (key.startsWith('Answers')) {
        const index = parseInt(key.replace('Answers', ''))
        const Result: Array<string> = values[key]
        Result.forEach((d) => {
          const aIndex = Answer.indexOf(d)
          this.TestQuestions[index].Answers[aIndex].Checked = true
        })
        continue
      }
      if (key.startsWith('AnswerTitle')) {
        const TowIndex: string[] = key.replace('AnswerTitle', '').split('-')
        this.TestQuestions[parseInt(TowIndex[0])].Answers[parseInt(TowIndex[1])].Title = values[key]
        continue
      }
      if (key.startsWith('Desc')) {
        const index = parseInt(key.replace('Desc', ''))
        this.TestQuestions[index].Desc = values[key]
        continue
      }
    }
    IPCRender('Main:SaveExam', { Path, ExamName: values.ExamName, ExamDesc: values.ExamDesc, TestQuestions: toJS(this.TestQuestions) })

  }

  LoadExam () {
    remote.dialog.showOpenDialog({
        title: '选择试卷文件',
        properties: ['openFile'],
        filters: [{ name: '试卷文件', extensions: ['exam'] }]
      }, (FilePaths) => {
        if (FilePaths) {
          IPCRender('Main:LoadExam', FilePaths[0])
        }
      }
    )
  }

  render () {
    const { getFieldDecorator } = this.props.form
    return (<Form id='MasterForm' labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
      <Form.Item label='试卷名称'>
        {getFieldDecorator('ExamName', { rules: [{ required: true, message: '请输入试卷名称' }] })(<Input style={{ width: 250 }}/>)}
        <label style={{ marginLeft: 10 }}>总分:{this.TotalScore}</label>
        <Button type='primary' onClick={() => {this.LoadExam()}} style={{ marginLeft: 20 }}>导入试卷</Button>
      </Form.Item>
      <Form.Item label='案例描述'>
        {getFieldDecorator(`ExamDesc`, { rules: [{ required: true, message: '请输入案例描述' }] })(<Input.TextArea rows={3}/>)}
      </Form.Item>
      {
        this.TestQuestions.map((d, i) => <Fragment key={i}>
          <Form.Item label={`题目${i + 1}`} className='QuestionItem'>
            {getFieldDecorator(`Question${i}`, { initialValue: d.Title, rules: [{ required: true, message: '请输入题目' }] })(<Input/>)}
            {i > 0 && <Icon className="dynamic-delete-button" type="minus-circle-o" onClick={() => {this.RemoveQuestion(i)}}/>}
          </Form.Item>
          <Form.Item label={`题目${i + 1}--描述`} className='QuestionItem'>
            {getFieldDecorator(`Desc${i}`, { initialValue: d.Desc, rules: [] })(<Input.TextArea rows={3}/>)}
          </Form.Item>
          <Form.Item label={`题目${i + 1}--分值`}>
            {getFieldDecorator(`Score${i}`, { initialValue: d.Score, rules: [{ required: true, message: '请输入题目分值' }], })(<InputNumber min={0} precision={0}/>)}
          </Form.Item>
          <Form.Item label={`题目${i + 1}--答案`}>
            {getFieldDecorator(`Answers${i}`, { initialValue: GetRightValue(d.Answers), rules: [{ required: true, message: '请选择正确答案' }] })(<Checkbox.Group>
              {d.Answers.map((a, ai) =>
                <Checkbox key={ai} value={Answer[ai]}>
                  <Form.Item label={Answer[ai]} className='AnswerItem'>
                    {getFieldDecorator(`AnswerTitle${i}-${ai}`, { initialValue: a.Title, rules: [{ required: true, message: '请输入答案' }] })(<Input/>)}
                    {ai !== d.Answers.length - 1 ? <Icon className="dynamic-delete-button" type="minus-circle-o" onClick={() => {this.RemoveQuestionAnswer(i, ai)}}/> :
                      <Icon className="dynamic-delete-button" type="plus-circle-o" onClick={() => {this.AddQuestionAnswer(i)}}/>}</Form.Item>
                </Checkbox>
              )}
            </Checkbox.Group>)}
          </Form.Item>
        </Fragment>)
      }
      <Form.Item wrapperCol={{ offset: 3 }} style={{ marginBottom: 0 }}>
        <Button type="dashed" onClick={() => {this.AddQuestion()}} style={{ width: '60%' }}><Icon type="plus"/>添加试题</Button>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 3 }} style={{ marginBottom: 0 }}>
        <Button type='primary' onClick={() => {this.CreateExam()}} style={{ width: '60%' }}>保存试卷</Button>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 3 }} style={{ marginBottom: 0 }}>
        <Button onClick={() => {this.props.ReCreate()}} style={{ width: '60%' }}>返回</Button>
      </Form.Item>
    </Form>)
  }
}

export default Form.create<CreateExamProps>()(CreateExam)