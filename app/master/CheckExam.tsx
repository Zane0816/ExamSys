import React from 'react'
import { hot } from 'react-hot-loader'
import { Button, Icon, List } from 'antd'
import { observer } from 'mobx-react'
import { remote } from 'electron'
import { IPCRender } from '../store/Commons'
import AppStore from '../store/AppStore'

type CheckExamProps = {} & Partial<CheckExamDefaultProps>
type CheckExamDefaultProps = {}

@observer
class CheckExam extends React.Component<CheckExamProps> {
  static defaultProps: CheckExamDefaultProps = {}

  constructor (props: Readonly<CheckExamProps>) {
    super(props)
  }

  LoadStandardAnswer () {
    remote.dialog.showOpenDialog({
        title: '选择标准答案文件',
        properties: ['openFile'],
        filters: [{ name: '试卷文件', extensions: ['check'] }]
      }, (FilePaths) => {
        if (FilePaths) {
          IPCRender('Main:LoadStandardAnswer', FilePaths[0])
        }
      }
    )
  }

  CheckStudentAnswers () {
    remote.dialog.showOpenDialog({
        title: '选择标准答案文件',
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: '试卷文件', extensions: ['answer'] }]
      }, (FilePaths) => {
        if (FilePaths) {
          IPCRender('Main:CheckStudentAnswers', FilePaths)
        }
      }
    )
  }

  render () {
    return (<List id='CheckExam' header={<><p><Button onClick={() => {this.CheckStudentAnswers()}}>加载考生答案</Button></p>
      <div className='CheckItem'>
        <b>考生</b>
        <b>得分</b>
        <b>错题</b>
      </div>
    </>}>
      {AppStore.ExamCheckResult.map((d, i) => <List.Item key={i} className='CheckItem'><label>{d.UserName}</label><label>{d.Score}</label><label>{d.ErrorQuestionNum.join(';')}</label></List.Item>)}
    </List>)
  }
}

export default hot(module)(CheckExam)