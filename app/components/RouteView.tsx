import React from 'react'
import { Redirect, Route, Switch } from 'react-router'
import AsyncComponent from './AsyncComponent'

// import { NotFound } from '../pages'

interface RouteViewProps {
  routes: Array<RouteInfo>
}

interface RouteViewState {

}

export default class RouteView extends React.Component<RouteViewProps, RouteViewState> {
  constructor (props: Readonly<RouteViewProps>) {
    super(props)
  }

  render () {
    return <Switch>
      {
        this.props.routes.map((d, key) =>
          d.component ?
            <Route key={key} path={d.path} exact={d.exact}
                   render={(props) => <AsyncComponent {...props} component={d.component!} routes={d.routes}/>}/> :
            <Route key={key} exact path={d.path} render={() => (<Redirect to={d.redirect!}/>)}/>
        )
      }
      {/*<Route component={NotFound}/>*/}
    </Switch>
  }
}