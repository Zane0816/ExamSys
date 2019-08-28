import React, {} from 'react'
import { hot } from 'react-hot-loader/root'
import { observer } from 'mobx-react'
import CreateExam from './CreateExam'
import { Button } from 'antd'
import { observable } from 'mobx'
import CheckExam from './CheckExam'
import ExamAnswer from '../components/ExamAnswer'
import { remote } from 'electron'
import { IPCRender } from '../store/Commons'
import AppStore from '../store/AppStore'

type HomeProps = {} & Partial<HomeDefaultProps>
type HomeDefaultProps = {}

@hot
@observer
class Home extends React.Component<HomeProps> {
  static defaultProps: HomeDefaultProps = {}

  constructor (props: Readonly<HomeProps>) {
    super(props)
  }

  @observable Type?: 2 | 1

  ReviewAnswer () {
    remote.dialog.showOpenDialog({
        title: '选择答卷文件',
        properties: ['openFile'],
        filters: [{ name: '答卷文件', extensions: ['answer'] }]
      }, (FilePaths) => {
        if (FilePaths) {
          IPCRender('Main:ReviewAnswer', FilePaths[0])
          this.Type = 2
        }
      }
    )
  }

  render () {
    if (this.Type === 1) {
      return <CreateExam ReCreate={() => {this.Type = undefined}}/>
    } else if (AppStore.ExamStatus === 2) {
      return <ExamAnswer ReReview={() => {this.Type = undefined}}/>
    } else {
      return <>
        <Button type='primary' className='OpBtn' onClick={() => {this.Type = 1}}>出题</Button>
        <Button type='primary' className='OpBtn' onClick={() => {this.ReviewAnswer()}}>试卷回顾</Button>
      </>
    }
  }
}

export default Home