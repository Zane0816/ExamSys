import React from 'react'
import { hot } from 'react-hot-loader'
import { observer } from 'mobx-react'
import { Button, Checkbox, Col, Form, Input, Modal, Row } from 'antd'
import { remote } from 'electron'
import { IPCRender } from '../store/Commons'
import AppStore from '../store/AppStore'
import { FormComponentProps } from 'antd/es/form'
import { observable, reaction } from 'mobx'
import ExamAnswer from '../components/ExamAnswer'
import { Answer, GetRightValue } from '../../main/Common'

type HomeProps = {} & Partial<HomeDefaultProps> & FormComponentProps
type HomeDefaultProps = {}

@hot(module)
@observer
class Home extends React.Component<HomeProps> {
  static defaultProps: HomeDefaultProps = {}

  constructor (props: Readonly<HomeProps>) {
    super(props)
  }

  ExamPath?: string
  CheckedExamChange?: Function
  @observable Score = 0

  componentDidMount (): void {
    this.CheckedExamChange = reaction(() => AppStore.CheckedExam, (CheckedExam) => {
      if (CheckedExam && AppStore.ExamInfo) {
        const { setFields, getFieldValue } = this.props.form
        const values: { [key: string]: { value: string[], errors: Array<Error> } } = {}
        AppStore.ExamInfo.Questions.forEach((d, i) => {
          const answer = getFieldValue(`Question${i}`)
          if (GetRightValue(d.Answers).join() !== (answer && answer.join() || '')) {
            values[`Question${i}`] = { value: answer, errors: [new Error('回答错误！')] }
          } else {
            this.Score += d.Score
          }
        })
        setFields(values)
      }
    })
  }

  componentWillUnmount (): void {
    this.CheckedExamChange && this.CheckedExamChange()
  }

  LoadExam () {
    remote.dialog.showOpenDialog({
        title: '选择试卷文件',
        properties: ['openFile'],
        filters: [{ name: '试卷文件', extensions: ['exam'] }]
      }, (FilePaths) => {
        if (FilePaths) {
          this.ExamPath = FilePaths[0]
          IPCRender('Main:LoadExam', FilePaths[0])
        }
      }
    )
  }

  ReviewAnswer () {
    remote.dialog.showOpenDialog({
        title: '选择答卷文件',
        properties: ['openFile'],
        filters: [{ name: '答卷文件', extensions: ['answer'] }]
      }, (FilePaths) => {
        if (FilePaths) {
          IPCRender('Main:ReviewAnswer', FilePaths[0])
        }
      }
    )
  }

  CheckAnswer () {
    Modal.confirm({
      title: '是否确认提交答卷?', onOk: () => {
        this.props.form.validateFields((err, values) => {
          if (!err) {
            if (this.ExamPath && AppStore.ExamInfo) {
              let Answers: string[] = []
              for (let key in values) {
                if (key.startsWith('Question')) {
                  const index = parseInt(key.replace('Question', ''))
                  if(values[key]){
                    const Result = values[key].sort()
                    Answers[index] = Result || ''
                  }
                  continue
                }
              }
              IPCRender('Main:CheckAnswer', { Path: this.ExamPath, UserName: values.UserName, UserNum: values.UserNum, Answers })
            }
          }
        })
      }
    })
  }

  render () {
    const { getFieldDecorator } = this.props.form
    if (AppStore.ExamStatus === 1 && AppStore.ExamInfo) {
      return <Form id='ExamList' labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
        <header><h1>{AppStore.ExamInfo.Name}</h1><label>总分:{AppStore.ExamInfo.TotalScore}</label>{AppStore.ExamCheckResult && <label style={{ marginLeft: 20, color: '#52c41a' }}>得分：{this.Score}</label>}</header>
        <Row>
          <Col span={12}>
            <Form.Item label='姓名' labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('UserName', { rules: [{ required: true, message: '请填写您的姓名' }] })(<Input/>)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='考号' labelCol={{ span: 6 }} wrapperCol={{ span: 16 }}>
              {getFieldDecorator('UserNum', { rules: [{ required: true, message: '请填写您的考号' }] })(<Input/>)}
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label='案例描述'>{AppStore.ExamInfo.ExamDesc}</Form.Item>
        {AppStore.ExamInfo.Questions.map((d, i) => <Form.Item label={`题目${i + 1}`} key={i}>
          <p><label>{d.Title}</label></p>
          {d.Desc && <p>问题描述：{d.Desc}</p>}
          {getFieldDecorator(`Question${i}`, {})(<Checkbox.Group disabled={AppStore.CheckedExam}>
            {d.Answers.map((da, ai) => <Checkbox value={Answer[ai]} key={ai}>{Answer[ai]}：{da.Title}</Checkbox>)}
          </Checkbox.Group>)}
        </Form.Item>)}
        <Form.Item wrapperCol={{ offset: 3 }}>
          {AppStore.CheckedExam ? <Button type='primary' onClick={() => {AppStore.ExamStatus = 0}}>返回</Button> : <Button type='primary' onClick={() => {this.CheckAnswer()}}>提交答卷</Button>}
        </Form.Item>
      </Form>
    } else if (AppStore.ExamStatus === 2 && AppStore.ExamAnswer) {
      return <ExamAnswer ReReview={() => {AppStore.ExamStatus = 0}}/>
    } else {
      return <><Button type='primary' className='OpBtn' onClick={() => {this.LoadExam()}}>开始考试</Button><Button type='primary' className='OpBtn' onClick={() => {this.ReviewAnswer()}}>试卷回顾</Button></>
    }
  }
}

export default (Form.create()(Home))