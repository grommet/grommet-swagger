import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import hljs from 'highlight.js';
import { Box, Button, Heading, ResponsiveContext, RoutedButton, Text, TextArea, TextInput } from 'grommet';
import { LinkPrevious as BackIcon, FormDown, FormUp } from 'grommet-icons';
import { definitionToJson } from './utils';

export default class extends Component {
  constructor(props) {
    super(props);
    const {
      data, methodName, origin, subPath,
    } = props;
    const defaultHeaders = {
      'Accept': data.consumes[0],
      'Content-Type': data.produces[0],
    };
    const method = data.paths[subPath][methodName];
    const bodyParameters = (method.parameters || []).filter(p => p.in === 'body');
    const queryParameters = (method.parameters || []).filter(p => p.in === 'query');
    const defaultValues = {};
    const values = {};
    const valuesValid = {};
    bodyParameters.forEach((p) => {
      const value = JSON.stringify(definitionToJson(data, p.schema), null, 2);
      values[p.name] = value;
      defaultValues[p.name] = value;
      valuesValid[p.name] = true;
    });
    this.state = {
      bodyParameters,
      defaultHeaders,
      defaultValues,
      queryParameters,
      url: origin + data.basePath + subPath,
      values,
      valuesValid,
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
      headersValid: true,
      url: origin + data.basePath + subPath,
    });
    /* eslint-enable react/no-did-mount-set-state */
  }

  componentDidUpdate() {
    if (this.responseRef) {
      hljs.highlightBlock(findDOMNode(this.responseRef));
    }
  }

  appendUrl = (name, value) =>
    () => {
      const { url } = this.state;
      let nextUrl = `${url}${url.indexOf('?') === -1 ? '?' : '&'}${name}=`;
      if (value) {
        nextUrl += encodeURIComponent(value);
      }
      this.setState({ url: nextUrl });
    };

  setHeaders = (event) => {
    const nextHeaders = event.target.value;
    let headersValid = false;
    try {
      JSON.parse(nextHeaders);
      headersValid = true;
    } catch (e) {
      // no-op
    }
    this.setState({ headers: nextHeaders, headersValid });
    try {
      localStorage.setItem('headers', nextHeaders);
    } catch (e) {
      console.warn(`Unable to preserve headers, probably due
        to being in private browsing mode.`);
    }
  };

  setBody = name =>
    (event) => {
      const { values: oldValues, valuesValid: oldValuesValid } = this.state;
      const nextValue = event.target.value;
      let valueValid = false;
      try {
        JSON.parse(nextValue);
        valueValid = true;
      } catch (e) {
        // no-op
      }
      this.setState({
        values: { ...oldValues, [name]: nextValue },
        valuesValid: { ...oldValuesValid, [name]: valueValid },
      });
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
      bodyParameters, defaultHeaders, defaultValues, headers, headersValid,
      queryParameters, response, responseText, showHeaders, state, url,
      values, valuesValid,
    } = this.state;
    return (
      <ResponsiveContext.Consumer>
        {(responsive = 'wide') => (
          <Box direction='row' justify='center'>
            <Box basis='xlarge' full='horizontal'>
              <Box margin='large'>
                <Box direction='row' justify='between' align='center' margin={{ bottom: 'large' }}>
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
                      <Text color='brand'>headers</Text>
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
                    <Box margin={{ bottom: 'large' }}>
                      <Box direction='row' justify='between' align='center'>
                        <Heading level={3} margin='none'>Headers</Heading>
                        {headersValid ? <Text color='status-ok'>valid JSON</Text> :
                        <Text color='status-critical'>invalid JSON</Text>}
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
                      <TextArea rows={4} value={headers} onChange={this.setHeaders} />
                    </Box>
                  )}

                  <Box
                    direction='row'
                    responsive={true}
                    align={responsive === 'wide' ? 'center' : undefined}
                    margin={{ bottom: 'medium' }}
                  >
                    <Heading level={2} margin='none'>{methodName.toUpperCase()}</Heading>
                    <Box
                      flex={true}
                      border={true}
                      margin={responsive === 'wide' ? { left: 'small' } : undefined}
                    >
                      <TextInput
                        plain={true}
                        value={url}
                        onInput={event => this.setState({ url: event.target.value })}
                      />
                    </Box>
                  </Box>

                  {queryParameters.map(p => (
                    <Box
                      key={p.name}
                      direction='row'
                      responsive={true}
                      justify='start'
                      align='start'
                      margin={{ bottom: 'xsmall' }}
                    >
                      <Box
                        basis={responsive === 'wide' ? 'small' : undefined}
                        flex={false}
                      >
                        <Button plain={true} onClick={this.appendUrl(p.name)}>
                          <Box align='start'>
                            <Text color='brand'><strong>{p.name}=</strong></Text>
                          </Box>
                        </Button>
                      </Box>
                      <Box
                        basis={responsive === 'wide' ? 'xsmall' : undefined}
                        flex={false}
                        margin={{ left: 'medium' }}
                      >
                        <Text>{p.type}</Text>
                      </Box>
                      <Box direction='row' wrap={true} flex={true}>
                        {p.enum && p.enum.map(value => (
                          <Button key={value} plain={true} onClick={this.appendUrl(p.name, value)}>
                            <Box align='start' margin={{ left: 'medium' }}>
                              <Text color='brand'><strong>{value}</strong></Text>
                            </Box>
                          </Button>
                        ))}
                        {p.items && p.items.enum && p.items.enum.map(value => (
                          <Button key={value} plain={true} onClick={this.appendUrl(p.name, value)}>
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
                      <Box direction='row' justify='between' align='center'>
                        <Heading level={3} margin='none'>{p.name}</Heading>
                        {valuesValid[p.name] ? <Text color='status-ok'>valid JSON</Text> :
                        <Text color='status-critical'>invalid JSON</Text>}
                        <Button
                          onClick={() => {
                            this.setState({
                              values: { ...values, [p.name]: defaultValues[p.name] },
                              valuesValid: { ...valuesValid, [p.name]: true },
                            });
                          }}
                        >
                          <Box pad='small'>
                            <Text color='brand'>reset</Text>
                          </Box>
                        </Button>
                      </Box>
                      <TextArea rows={8} value={values[p.name]} onChange={this.setBody(p.name)} />
                    </Box>
                  ))}

                  <Box margin={{ vertical: 'large' }}>
                    <Button type='submit' primary={true} label='Send' />
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
          </Box>)}
      </ResponsiveContext.Consumer>
    );
  }
}
