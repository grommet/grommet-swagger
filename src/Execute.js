import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import hljs from 'highlight.js';
import { Box, Button, Heading, RoutedButton, Text, TextArea, TextInput } from 'grommet';
import { LinkPrevious as BackIcon, FormDown, FormUp } from 'grommet-icons';
import { definitionToJson } from './utils';

export default class extends Component {
  constructor(props) {
    super(props);
    const {
      data, methodName, origin, path, subPath,
    } = props;
    const defaultHeaders = {
      'Accept': data.consumes[0],
      'Content-Type': data.produces[0],
    };
    const method = data.paths[path][methodName];
    const bodyParameters = (method.parameters || []).filter(p => p.in === 'body');
    const queryParameters = (method.parameters || []).filter(p => p.in === 'query');
    const values = {};
    bodyParameters.forEach((p) => {
      values[p.name] = JSON.stringify(definitionToJson(data, p.schema), null, 2);
    });
    this.state = {
      bodyParameters,
      defaultHeaders,
      queryParameters,
      url: origin + data.basePath + subPath,
      values,
    };
  }

  componentDidMount() {
    const { data, origin: propsOrigin, subPath } = this.props;
    const { defaultHeaders } = this.state;
    let headers;
    let origin;
    try {
      headers = JSON.parse(localStorage.getItem('headers'));
      origin = localStorage.getItem('origin');
    } finally {
      if (!headers) {
        headers = defaultHeaders;
      }
      if (!origin) {
        origin = propsOrigin;
      }
    }
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({
      headers: JSON.stringify(headers, null, 2),
      url: origin + data.basePath + subPath,
    });
    /* eslint-enable react/no-did-mount-set-state */
  }

  componentDidUpdate() {
    if (this.responseRef) {
      hljs.highlightBlock(findDOMNode(this.responseRef));
    }
  }

  append = (name, value) =>
    () => {
      const { url } = this.state;
      let nextUrl = `${url}${url.indexOf('?') === -1 ? '?' : '&'}${name}=`;
      if (value) {
        nextUrl += encodeURIComponent(value);
      }
      this.setState({ url: nextUrl });
    };

  send = () => {
    const { methodName, origin } = this.props;
    const {
      bodyParameters, headers, url, values,
    } = this.state;
    const started = new Date();
    this.setState({ state: 'pending', response: undefined, responseText: undefined });
    const parser = document.createElement('a');
    parser.href = url;
    if (origin !== parser.origin) {
      try {
        localStorage.setItem('origin', parser.origin);
      } catch (e) {
        console.warn(`Unable to preserve origin, probably due
          to being in private browsing mode.`);
      }
    } else {
      try {
        localStorage.removeItem('origin');
      } catch (e) {
        // ignore
      }
    }
    const options = {
      method: methodName.toUpperCase(),
      headers: JSON.parse(headers),
    };
    if (bodyParameters.length > 0) {
      const body = values[bodyParameters.filter(p => values[p.name])[0].name];
      options.body = body;
    }
    fetch(url, options)
      .then((response) => {
        // first see if it looks like JSON
        response.json()
          .then((json) => {
            const now = new Date();
            this.setState({
              response,
              responseText: JSON.stringify(json, null, 2),
              state: `${now.getTime() - started.getTime()} ms`,
            });
          })
          .catch(() => {
            // fall back to text
            response.text().then((responseText) => {
              this.setState({ response, responseText });
            });
          });
      });
  }

  render() {
    const { contextSearch, methodName, path } = this.props;
    const {
      bodyParameters, defaultHeaders, headers, queryParameters,
      response, responseText, showHeaders, state, url, values,
    } = this.state;
    return (
      <Box>
        <Box margin='large'>

          <Box direction='row' justify='between' align='center'>
            <RoutedButton
              plain={true}
              path={`/endpoint${contextSearch}&path=${encodeURIComponent(path)}`}
            >
              <Box direction='row' align='center'>
                <BackIcon color='brand' />
                <Box pad={{ horizontal: 'small' }}>
                  <Text color='brand' size='large'>{path.substr(1)}</Text>
                </Box>
              </Box>
            </RoutedButton>
            <Button
              plain={true}
              onClick={() => this.setState({ showHeaders: !showHeaders })}
            >
              <Box direction='row' align='center'>
                <Text color='brand' size='large'>headers</Text>
                <Box margin={{ left: 'xsmall' }}>
                  {showHeaders ? <FormUp color='brand' /> : <FormDown color='brand' />}
                </Box>
              </Box>
            </Button>
          </Box>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              this.send();
            }}
          >

            {showHeaders && (
              <Box>
                <Box direction='row' align='center'>
                  <Heading level={3}>Headers</Heading>
                  <Button
                    onClick={() => {
                      this.setState({ headers: JSON.stringify(defaultHeaders, null, 2) });
                    }}
                  >
                    <Box pad='small'>
                      <Text color='brand'>reset</Text>
                    </Box>
                  </Button>
                </Box>
                <TextArea
                  rows={4}
                  value={headers}
                  onChange={(event) => {
                    const nextHeaders = event.target.value;
                    this.setState({ headers: nextHeaders });
                    try {
                      localStorage.setItem('headers', nextHeaders);
                    } catch (e) {
                      console.warn(`Unable to preserve headers, probably due
                        to being in private browsing mode.`);
                    }
                  }}
                />
              </Box>
            )}

            <Box direction='row' responsive={true} align='center' margin={{ vertical: 'medium' }}>
              <Heading level={2} margin='none'>{methodName.toUpperCase()}</Heading>
              <Box flex={true} border={true} margin={{ left: 'small' }}>
                <TextInput
                  plain={true}
                  value={url}
                  onInput={event => this.setState({ url: event.target.value })}
                />
              </Box>
            </Box>

            {queryParameters.map(p => (
              <Box direction='row' justify='start' align='start'>
                <Box basis='small' flex={false}>
                  <Button key={p.name} plain={true} onClick={this.append(p.name)}>
                    <Box align='start'>
                      <Text color='brand'><strong>{p.name}</strong></Text>
                    </Box>
                  </Button>
                </Box>
                {!p.enum && (
                  <Box margin={{ left: 'medium' }} flex={false}>
                    <Text>{p.type}</Text>
                  </Box>
                )}
                <Box direction='row' wrap={true}>
                  {p.enum && p.enum.map(value => (
                    <Button key={value} plain={true} onClick={this.append(p.name, value)}>
                      <Box align='start' margin={{ left: 'medium' }}>
                        <Text color='brand'><strong>{value}</strong></Text>
                      </Box>
                    </Button>
                  ))}
                  {p.items && p.items.enum && p.items.enum.map(value => (
                    <Button key={value} plain={true} onClick={this.append(p.name, value)}>
                      <Box align='start' margin={{ left: 'medium' }}>
                        <Text color='brand'><strong>{value}</strong></Text>
                      </Box>
                    </Button>
                  ))}
                </Box>
              </Box>
            ))}

            {bodyParameters.map(p => (
              <Box key={p.name}>
                <Heading level={3} margin='none'>{p.name}</Heading>
                <TextArea
                  rows={8}
                  value={values[p.name]}
                  onChange={(event) => {
                    const { oldValues } = this.state;
                    this.setState({ values: { ...oldValues, [p.name]: event.target.value } });
                  }}
                />
              </Box>
            ))}

            <Box margin={{ vertical: 'medium' }}>
              <Button type='submit' fill={true} primary={true} label='Send' />
            </Box>
          </form>

          <Box direction='row' justify='between' align='center'>
            <Heading level={2} margin={{ bottom: 'medium', top: 'none' }}>Response</Heading>
            <Text>{state}</Text>
          </Box>
          <Box background='light-2' pad='medium'>
            { response ? (
              <Box>
                <Text>Status: {response.status} {response.statusText}</Text>
                <pre>
                  <code
                    ref={(ref) => { this.responseRef = ref; }}
                    className='json'
                    style={{ background: 'transparent', padding: 0 }}
                  >
                    {responseText}
                  </code>
                </pre>
              </Box>
            ) : null }
          </Box>
        </Box>
      </Box>
    );
  }
}
