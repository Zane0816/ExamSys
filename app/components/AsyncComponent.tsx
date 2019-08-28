import React from 'react'
import Loading from './Loading'

interface AsyncComponentProps {
  component (): Promise<{ default: React.ComponentType }>,

  routes?: Array<RouteInfo>
}

interface AsyncComponentState {
  Component?: { default: React.ComponentType }
}

export default class AsyncComponent extends React.Component<AsyncComponentProps, AsyncComponentState> {
  constructor (props: Readonly<AsyncComponentProps>) {
    super(props)
    this.state = {}
  }

  async componentDidMount () {
    this.setState({
      Component: await this.props.component()
    })
  }

  render () {
    const C = this.state.Component
    return C ? React.createElement(C!.default as any, { ...this.props }) : <Loading/>
  }
}