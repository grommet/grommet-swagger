import React, { Component } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';

import { createBrowserHistory } from 'history';
import jsyaml from 'js-yaml';

import { Grommet } from 'grommet';
import { hpe } from 'grommet/themes';

import Home from './Home';
import Endpoint from './Endpoint';

const history = createBrowserHistory();

const API_DEFINITION_URL = 'http://localhost:8787/swagger.yml';

export default class App extends Component {
  state = { data: { info: {}, paths: {} } }

  componentDidMount() {
    fetch(API_DEFINITION_URL, { method: 'GET' })
      .then(response => response.text())
      .then(text => jsyaml.load(text))
      .then(data => this.setState({ data }))
      .catch(error => console.error(error));
  }

  render() {
    const { data } = this.state;
    return (
      <Router history={history}>
        <Grommet theme={hpe}>
          <Switch>
            <Route exact={true} path='/' render={() => <Home data={data} />} />
            <Route
              path='/endpoint'
              render={({ location: { search } }) =>
                <Endpoint data={data} path={queryString.parse(search).path} />
              }
            />
          </Switch>
        </Grommet>
      </Router>
    );
  }
}
