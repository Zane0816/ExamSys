import React from 'react'
import { render } from 'react-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import './css/base.css'
import { remote } from 'electron'
import WinFrame from './components/WinFrame'
import MasterHome from './master/Home'
import ClientHome from './client/Home'

// @ts-ignore
const App = <ConfigProvider locale={remote.app.getLocale().substr(0, 2) === 'zh' ? zhCN : null}>
  <WinFrame>
    {process.env.BUILD_TYPE.includes('Master') && <MasterHome/>}
    {process.env.BUILD_TYPE.includes('Client') && <ClientHome/>}
  </WinFrame>
</ConfigProvider>

render(App, document.getElementById('root'))