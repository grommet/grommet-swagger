import React, { Component } from 'react';
import { Redirect, Router, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';

import { createBrowserHistory } from 'history';
import jsyaml from 'js-yaml';

import { Grommet } from 'grommet';

import Choose from './Choose';
import Endpoints from './Endpoints';
import Endpoint from './Endpoint';
import Loading from './Loading';

const history = createBrowserHistory();

export default class App extends Component {
  state = { loading: true }

  componentDidMount() {
    const { url } = queryString.parse(history.location.search);
    if (url) {
      this.onLoad(url);
    } else {
      this.onUnload();
    }
  }

  onLoad = (url) => {
    this.setState({
      data: undefined, error: undefined, loading: true, url,
    });
    fetch(url, { method: 'GET' })
      .then(response => response.text())
      .then(text => jsyaml.load(text))
      .then(data => this.setState({ data, loading: false }))
      .then(() => {
        if (queryString.parse(history.location.search).url !== url) {
          history.replace(`?url=${encodeURIComponent(url)}`);
        }
      })
      .catch(error => this.setState({ error: error.message, loading: false }));
  }

  onUnload = () => {
    this.setState({ data: undefined, error: undefined, loading: false });
  }

  render() {
    const {
      data, error, loading, url,
    } = this.state;
    return (
      <Router history={history}>
        <Grommet>
          <Switch>
            <Route
              exact={true}
              path='/'
              render={() => {
                if (data) {
                  return <Endpoints data={data} url={url} onUnload={this.onUnload} />;
                }
                return (
                  <Choose loading={loading} onLoad={this.onLoad} error={error} url={url} />
                );
              }}
            />
            <Route
              path='/endpoint'
              render={({ location: { search } }) => {
                if (loading) {
                  return <Loading />;
                }
                if (!data) {
                  return <Redirect to={`/?url=${encodeURIComponent(url)}`} />;
                }
                window.scrollTo(0, 0);
                return (
                  <Endpoint data={data} url={url} path={queryString.parse(search).path} />
                );
              }}
            />
          </Switch>
        </Grommet>
      </Router>
    );
  }
}
