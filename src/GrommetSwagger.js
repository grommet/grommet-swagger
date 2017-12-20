import 'whatwg-fetch';

import React, { Component } from 'react';
import { Redirect, Router, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import { createBrowserHistory } from 'history';
import jsyaml from 'js-yaml';
import { Grommet, hpe as hpeTheme } from 'grommet';
import Choose from './Choose';
import Endpoints from './Endpoints';
import Endpoint from './Endpoint';
import Execute from './Execute';
import Loading from './Loading';

const history = createBrowserHistory({
  // basename: '/grommet-swagger',
});

const THEMES = {
  hpe: hpeTheme,
};

export default class GrommetSwagger extends Component {
  state = { loading: true, contextSearch: '?' };

  componentDidMount() {
    const url = this.props.url || queryString.parse(history.location.search).url;
    const theme = this.props.theme || queryString.parse(history.location.search).theme;
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
    const parser = document.createElement('a');
    parser.href = url;
    this.setState({
      data: undefined, error: undefined, loading: true, origin: parser.origin, theme, url,
    });
    fetch(url, { method: 'GET' })
      .then(response => response.text())
      .then(text => jsyaml.load(text))
      .then(data => this.setState({ data, loading: false }))
      .then(() => {
        if (!this.props.url) {
          let contextSearch = `?url=${encodeURIComponent(url)}`;
          if (theme) {
            contextSearch += `&theme=${encodeURIComponent(theme)}`;
          }
          this.setState({ contextSearch });
          history.replace(contextSearch);
        }
      })
      .catch(error => this.setState({ error: error.message, loading: false }));
  }

  onUnload = () => {
    this.setState({ data: undefined, error: undefined, loading: false });
  }

  render() {
    const {
      contextSearch, data, error, loading, origin, theme, url,
    } = this.state;
    let content;
    if (loading) {
      content = <Loading />;
    } else {
      content = (
        <Switch>
          <Route
            exact={true}
            path='/'
            render={() => {
              if (!data && !this.props.url) {
                return <Redirect to='/choose' />;
              }
              if (data) {
                return (
                  <Endpoints
                    contextSearch={contextSearch}
                    data={data}
                    theme={theme}
                    onUnload={!this.props.url ? this.onUnload : undefined}
                  />
                );
              }
              return <span />;
            }}
          />
          <Route
            path='/choose'
            render={() => {
              if (data) {
                return <Redirect to='/' />;
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
              if (!data) {
                return <Redirect to={`/${contextSearch}`} />;
              }
              const { path } = queryString.parse(search);
              window.scrollTo(0, 0);
              return (
                <Endpoint
                  contextSearch={contextSearch}
                  data={data}
                  path={path}
                />
              );
            }}
          />
          <Route
            path='/execute'
            render={({ location: { search } }) => {
              if (!data) {
                return <Redirect to={`/${contextSearch}`} />;
              }
              const { methodName, path, subPath } = queryString.parse(search);
              window.scrollTo(0, 0);
              return (
                <Execute
                  contextSearch={contextSearch}
                  data={data}
                  methodName={methodName}
                  origin={origin}
                  path={path}
                  subPath={subPath}
                />
              );
            }}
          />
        </Switch>
      );
    }
    return (
      <Router history={history}>
        <Grommet theme={THEMES[theme]}>
          {content}
        </Grommet>
      </Router>
    );
  }
}
