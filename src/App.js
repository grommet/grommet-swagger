import React, { Component } from 'react';
import { Redirect, Router, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';

import { createBrowserHistory } from 'history';
import jsyaml from 'js-yaml';

import { Grommet, hpe as hpeTheme } from 'grommet';

import Choose from './Choose';
import Endpoints from './Endpoints';
import Endpoint from './Endpoint';
import Loading from './Loading';

const history = createBrowserHistory({
  basename: '/grommet-swagger',
});

const THEMES = {
  hpe: hpeTheme,
};

export default class App extends Component {
  state = { loading: true }

  componentDidMount() {
    const { theme, url } = queryString.parse(history.location.search);
    if (url) {
      this.onLoad(url, theme);
    } else {
      this.onUnload();
      /* eslint-disable react/no-did-mount-set-state */
      this.setState({ theme });
      /* eslint-enable react/no-did-mount-set-state */
    }
  }

  onLoad = (url, theme) => {
    this.setState({
      data: undefined, error: undefined, loading: true, theme, url,
    });
    fetch(url, { method: 'GET' })
      .then(response => response.text())
      .then(text => jsyaml.load(text))
      .then(data => this.setState({ data, loading: false }))
      .then(() => {
        // const { theme: searchTheme, url: searchUrl } =
        //   queryString.parse(history.location.search);
        let contextSearch = `?url=${encodeURIComponent(url)}`;
        if (theme) {
          contextSearch += `&theme=${encodeURIComponent(theme)}`;
        }
        this.setState({ contextSearch });
        history.replace(contextSearch);
      })
      .catch(error => this.setState({ error: error.message, loading: false }));
  }

  onUnload = () => {
    this.setState({ data: undefined, error: undefined, loading: false });
  }

  render() {
    const {
      contextSearch, data, error, loading, theme, url,
    } = this.state;
    return (
      <Router history={history}>
        <Grommet theme={THEMES[theme]}>
          <Switch>
            <Route
              exact={true}
              path='/'
              render={() => {
                if (data) {
                  return (
                    <Endpoints
                      contextSearch={contextSearch}
                      data={data}
                      theme={theme}
                      onUnload={this.onUnload}
                    />
                  );
                }
                return (
                  <Choose
                    loading={loading}
                    onLoad={this.onLoad}
                    error={error}
                    theme={theme}
                    url={url}
                  />
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
                  return <Redirect to={`/${contextSearch}`} />;
                }
                window.scrollTo(0, 0);
                return (
                  <Endpoint
                    contextSearch={contextSearch}
                    data={data}
                    path={queryString.parse(search).path}
                  />
                );
              }}
            />
          </Switch>
        </Grommet>
      </Router>
    );
  }
}
