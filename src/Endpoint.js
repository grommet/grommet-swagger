import { RoutedAnchor, Box, Heading, Markdown, ResponsiveContext, RoutedButton, Text } from 'grommet';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import hljs from 'highlight.js';
import { LinkNext } from 'grommet-icons';
import Nav from './Nav';
import { sanitizeForMarkdown, searchString } from './utils';

class Schema extends Component {
  componentDidMount() {
    if (this.ref) {
      hljs.highlightBlock(findDOMNode(this.ref));
    }
  }

  render() {
    const { label, schema } = this.props;
    if (!schema) {
      return null;
    }
    return (
      <Box flex={true}>
        {label ? <Heading level={4} size='small'>{label}</Heading> : null}
        <Box
          background='light-1'
          pad={{ horizontal: 'small' }}
          style={{ maxWidth: '70vw', maxHeight: 384, overflow: 'auto' }}
        >
          <pre>
            <code ref={(ref) => { this.ref = ref; }} className='json'>
              {JSON.stringify(schema, null, 2)}
            </code>
          </pre>
        </Box>
      </Box>
    );
  }
}

const Parameter = ({ data, parameter, first }) => (
  <Box border={first ? 'horizontal' : 'bottom'} pad={{ vertical: 'medium' }}>
    <Box direction='row' pad={{ bottom: 'small' }} wrap={true}>
      <Box basis={parameter.name.length > 30 ? 'large' : 'medium'} pad={{ right: 'medium' }}>
        <Heading level={3} size='small' margin='small'>
          <strong><code>{parameter.name}</code></strong>
        </Heading>
      </Box>
      <Box basis='medium' pad={{ right: 'medium' }}>
        <Markdown>
          {sanitizeForMarkdown(parameter.description)}
        </Markdown>
        {parameter.type !== 'string' ? <Text color='dark-5'>{parameter.type}</Text> : null}
        {parameter.required ? <Text color='dark-5'>required</Text> : null}
      </Box>
    </Box>
    {console.log('parameter', parameter)}
    {console.log('param schema', parameter.schema)}
    {parameter.schema ? console.log('param example', parameter.schema.example) : console.log('param ex notfound')}
    <Schema data={data} schema={parameter.schema ? parameter.schema.example : null} />
  </Box>
);

const Parameters = ({ data, label, parameters }) => [
  parameters.length > 0 ? <Heading key='heading' level={2}>{label}</Heading> : null,
  parameters.map((parameter, index) => (
    <Parameter
      key={parameter.name}
      data={data}
      parameter={parameter}
      first={index === 0}
    />
  )),
];


const refCheck = (res) => {
  if (res.schema) {
    if (res.schema.example) {
      return res.schema.example;
    } else if (res.schema.allOf) {
      return res.schema.allOf;
    }
  }
  return res.schema;
};

const parseSchemaName = (ref) => {
  if (!ref || ref.indexOf('/') === -1) return undefined;
  const name = ref.split('/');
  return name[name.length - 1];
};

const Response = ({
  data, name, response, first,
}) => (
  <Box border={first ? 'horizontal' : 'bottom'} pad={{ vertical: 'medium' }}>
    <Box direction='row' pad={{ bottom: 'small' }} align='start'>
      <Box basis='xxsmall'>
        <Heading level={3} size='small' margin='small'>
          <strong><code>{name}</code></strong>
        </Heading>
      </Box>
      <Box flex={true} pad={{ horizontal: 'medium' }} margin={{ vertical: 'small' }}>
        <Markdown>
          {sanitizeForMarkdown(response.description)}
        </Markdown>
      </Box>
    </Box>
    {response.schema && parseSchemaName(response.schema.$ref) &&
      <Box direction='column' align='end'>
        <pre>
          <strong>
            <RoutedAnchor
              label={parseSchemaName(response.schema.$ref)}
              path={`/definition?name=${parseSchemaName(response.schema.$ref)}`}
            />
          </strong>
        </pre>
      </Box>
    }
    {console.log('response', response)}
    {console.log('res schema', response.schema)}
    {response.schema ? console.log('res example', response.schema.example) : console.log('res ex notfound')}
    {response.examples ?
      Object.keys(response.examples).map(key =>
        <Schema key={key} label={key} data={data} schema={response.examples[key]} />)
      :
      <Schema data={data} schema={refCheck(response)} />
    }
  </Box>
);

const Header = ({
  data, executable, methodName, subPath,
}) => (
  <Box direction='row' align='center' wrap={true}>
    <Box background='brand' pad={{ horizontal: 'medium', vertical: 'xsmall' }}>
      <Text size='xlarge'>
        <strong>{methodName.toUpperCase()}</strong>
      </Text>
    </Box>
    <Box margin={{ horizontal: 'small' }}>
      <Text size='xlarge' color='brand'>
        {data.basePath}{subPath}
      </Text>
    </Box>
    {executable ? <LinkNext color='brand' /> : null}
  </Box>
);

class Method extends Component {
  render() {
    const {
      contextSearch, data, executable, method, methodName, path, subPath,
    } = this.props;
    console.log('METHOD', method);
    let header = (
      <Header
        data={data}
        subPath={subPath}
        methodName={methodName}
        executable={executable}
      />
    );
    if (executable) {
      header = (
        <RoutedButton
          path={executable ?
            `/execute${contextSearch}&${searchString({ path, subPath, methodName })}`
            : undefined}
          fill={true}
        >
          {header}
        </RoutedButton>
      );
    }
    return (
      <Box key={methodName}>
        <Box>
          <Heading level={2}>
            {header}
          </Heading>
          { method && method.summary &&
            <Markdown>
              {sanitizeForMarkdown(method.summary)}
            </Markdown>
          }
          { method && method.description &&
            <Markdown>
              {sanitizeForMarkdown(method.description)}
            </Markdown>
          }
        </Box>
        <Box margin={{ bottom: 'medium' }}>
          <Parameters
            data={data}
            label='Parameters'
            parameters={method.parameters}
          />
          <Heading level={2}>Responses</Heading>
          {Object.keys(method.responses).map((responseName, index) => (
            <Response
              key={responseName}
              data={data}
              name={responseName}
              response={method.responses[responseName]}
              first={index === 0}
            />
          ))}
        </Box>
      </Box>
    );
  }
}

export default class Endpoint extends Component {
  render() {
    const {
      contextSearch, data, executable, path,
    } = this.props;
    return (
      <ResponsiveContext.Consumer>
        {(responsive = 'wide') => (
          <Box direction='row-responsive' justify='center'>
            <Box
              basis={responsive === 'wide' ? 'xlarge' : undefined}
              flex='shrink'
              pad='large'
              style={{ minWidth: 0 }}
            >
              <Box pad={{ bottom: 'large' }} border='bottom'>
                <Heading level={1} margin='none'>{path.substr(1)}</Heading>
              </Box>
              {Object.keys(data.paths)
                // everything that starts with the path we have
                .filter(p => (p === path || p.substr(0, path.length + 1) === `${path}/`))
                .map(subPath =>
                  Object.keys(data.paths[subPath])
                  .map(methodName => (
                    <Method
                      key={methodName}
                      contextSearch={contextSearch}
                      data={data}
                      executable={executable}
                      method={data.paths[subPath][methodName]}
                      methodName={methodName}
                      path={path}
                      subPath={subPath}
                    />
                  )))}
            </Box>
            <Nav contextSearch={contextSearch} data={data} />
          </Box>)}
      </ResponsiveContext.Consumer>
    );
  }
}

Endpoint.propTypes = {
  contextSearch: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  executable: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
};
