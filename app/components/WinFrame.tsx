import React from 'react'
import { Layout, Modal } from 'antd'
import { remote } from 'electron'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { hot } from 'react-hot-loader'

type WinFrameProps = {} & Partial<WinFrameDefaultProps>
type WinFrameDefaultProps = {}
const Win = remote.getCurrentWindow()

@hot(module)
@observer
class WinFrame extends React.Component<WinFrameProps> {
  static defaultProps: WinFrameDefaultProps = {}

  constructor (props: Readonly<WinFrameProps>) {
    super(props)
  }

  @observable IsMax: boolean = false

  componentDidMount () {
    Win.on('maximize', () => {
      this.IsMax = true
    })
    Win.on('unmaximize', () => {
      this.IsMax = false
    })
  }

  WinClose () {
    Modal.confirm({
      title: '是否退出?',
      onOk () {
        Win.close()
      }
    })
  }

  WinSmall () {
    Win.minimize()
  }

  WinMax () {
    if (this.IsMax) {
      Win.unmaximize()
    } else {
      Win.maximize()
    }
  }

  render () {
    const App = remote.app
    return (<Layout id='WinFrame'>
      <Layout.Header className='Top'>
        <span className="LogoIcon"/>
        <span className="Title">{App.getName()} v{App.getVersion()}</span>
        <span className="Close Icon" onClick={() => {this.WinClose()}}/>
        <span className={`Max Icon ${this.IsMax && 'active'}`} onClick={() => {this.WinMax()}}/>
        <span className="Min Icon" onClick={() => {this.WinSmall()}}/>
      </Layout.Header>
      <Layout.Content>
        {this.props.children}
      </Layout.Content>
    </Layout>)
  }
}

export default WinFrame