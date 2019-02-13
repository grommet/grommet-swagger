import React, { Component } from 'react';
import { Redirect, Router, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import SwaggerParser from 'swagger-parser';
import queryString from 'query-string';
import { createBrowserHistory } from 'history';
import jsyaml from 'js-yaml';
import { Grommet } from 'grommet';
import { hpe } from 'grommet-theme-hpe';
import Choose from './Choose';
import Endpoints from './Endpoints';
import Endpoint from './Endpoint';
import Execute from './Execute';
import Loading from './Loading';
import Definition from './Definition';
import { filterHiddenPaths, deepClone } from './utils';

const THEMES = {
  hpe,
};

export default class GrommetSwagger extends Component {
  constructor(props) {
    super(props);
    const options = props.routePrefix ? { basename: props.routePrefix } : undefined;
    const history = createBrowserHistory(options);
    this.state = { history, loading: true, contextSearch: '?' };
  }

  componentDidMount() {
    const { history } = this.state;
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

  getOrigin = (htmlHost, configHost, configUrl) => {
    const parser = document.createElement('a');
    parser.href = configUrl;
    const origin = htmlHost || configHost || parser.origin;

    if (origin.slice(0, 4) !== 'http') {
      // Swagger host is defined without protocol.
      return `https://${origin}`;
    }
    return origin;
  }

  parserUtil = async (data) => {
    const parsedRefs = await SwaggerParser.bundle(deepClone(data));
    const parsedSwagger = await SwaggerParser.dereference(deepClone(data));
    return { parsedSwagger, parsedRefs };
  }
  onLoad = (url, theme) => {
    const { history } = this.state;
    this.setState({
      data: undefined, error: undefined, loading: true, theme, url,
    });
    fetch(url, { method: 'GET' })
      .then(response => response.text())
      .then(text => jsyaml.load(text))
      .then(filterHiddenPaths)
      .then(data => this.parserUtil(data))
      .then(({ parsedSwagger, parsedRefs }) => {
        document.title = parsedSwagger.info.title;
        this.setState({
          data: parsedSwagger,
          refs: parsedRefs,
          loading: false,
          // Prioritize API origin values
          // HTML host property -> config file host key -> config file origin
          origin: this.getOrigin(this.props.host, parsedSwagger.host, url),
        });
      })
      .then(() => {
        if (!this.props.url) {
          let contextSearch = `?url=${encodeURIComponent(url)}`;
          if (theme) {
            contextSearch += `&theme=${encodeURIComponent(theme)}`;
          }
          this.setState({ contextSearch });
          if (queryString.parse(history.location.search).url.indexOf(url) === -1) {
            history.replace(contextSearch);
          }
        }
      })
      .catch(error => this.setState({ error: error.message, loading: false }));
  }

  onUnload = () => {
    this.setState({ data: undefined, error: undefined, loading: false });
  }

  render() {
    const { background, executable, data: propsData } = this.props;
    const {
      contextSearch, data: stateData, refs, error, history, loading, origin, theme, url,
    } = this.state;
    const data = { ...propsData, ...stateData };
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
              if (!stateData && !this.props.url) {
                return <Redirect to='/choose' />;
              }
              if (stateData) {
                return (
                  <Endpoints
                    background={background}
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
              if (stateData) {
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
              if (!stateData) {
                return <Redirect to={`/${contextSearch}`} />;
              }
              const { path } = queryString.parse(search);
              window.scrollTo(0, 0);
              return (
                <Endpoint
                  contextSearch={contextSearch}
                  data={data}
                  refs={refs}
                  executable={executable}
                  path={path}
                />
              );
            }}
          />
          <Route
            path='/definition'
            render={({ location: { search } }) => {
              const { name } = queryString.parse(search);
              window.scrollTo(0, 0);
              return (
                <Definition
                  name={name}
                  data={data}
                  contextSearch={contextSearch}
                />
              );
            }}
          />
          <Route
            path='/execute'
            render={({ location: { search } }) => {
              if (!stateData) {
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
          <Redirect from='/*' to='/' />
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

GrommetSwagger.propTypes = {
  background: PropTypes.any,
  executable: PropTypes.bool,
  host: PropTypes.string,
  routePrefix: PropTypes.string,
  theme: PropTypes.string,
  url: PropTypes.string,
};

GrommetSwagger.defaultProps = {
  background: undefined,
  executable: true,
  host: undefined,
  routePrefix: undefined,
  theme: undefined,
  url: undefined,
};
