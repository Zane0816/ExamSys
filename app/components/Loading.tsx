import * as React from 'react'

export default class Loading extends React.Component {
  render () {
    return (<div className="lds-ripple">
      <div/>
      <div/>
      <p>正在加载资源....</p>
    </div>)
  }
}