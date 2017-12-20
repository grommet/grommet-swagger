import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import hljs from 'highlight.js';
import { Box, Heading, Markdown, Responsive, RoutedButton, Text } from 'grommet';
import { LinkNext } from 'grommet-icons';
import Nav from './Nav';
import { definitionToJson, searchString } from './utils';

class Schema extends Component {
  componentDidMount() {
    if (this.ref) {
      hljs.highlightBlock(findDOMNode(this.ref));
    }
  }

  render() {
    const { data, schema } = this.props;
    if (!schema) {
      return null;
    }
    return (
      <Box
        flex={true}
        background='light-1'
        pad={{ horizontal: 'small' }}
        style={{ maxWidth: '70vw', maxHeight: 384, overflow: 'auto' }}
      >
        <pre>
          <code ref={(ref) => { this.ref = ref; }} className='json'>
            {JSON.stringify(definitionToJson(data, schema), null, 2)}
          </code>
        </pre>
      </Box>
    );
  }
}

const Parameter = ({ data, parameter, first }) => (
  <Box border={first ? 'horizontal' : 'bottom'} pad={{ vertical: 'medium' }}>
    <Box direction='row' pad={{ bottom: 'small' }}>
      <Box basis='small'>
        <Heading level={3} size='small' margin='small'>
          <strong><code>{parameter.name}</code></strong>
        </Heading>
      </Box>
      <Box flex={true} pad={{ horizontal: 'medium' }}>
        <Markdown
          content={(parameter.description || '')
            .replace(new RegExp('</BR>', 'gi'), '\n\n')}
        />
        {parameter.type !== 'string' ? <Text color='dark-5'>{parameter.type}</Text> : null}
        {parameter.required ? <Text color='dark-5'>required</Text> : null}
      </Box>
    </Box>
    <Schema data={data} schema={parameter.schema} />
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

const Response = ({
  data, name, response, first,
}) => (
  <Box border={first ? 'horizontal' : 'bottom'} pad={{ vertical: 'medium' }}>
    <Box direction='row' pad={{ bottom: 'small' }}>
      <Box basis='small'>
        <Heading level={3} size='small' margin='small'>
          <strong><code>{name}</code></strong>
        </Heading>
      </Box>
      <Box flex={true} pad={{ horizontal: 'medium' }}>
        <Markdown
          content={(response.description || '')
            .replace(new RegExp('</BR>', 'gi'), '\n\n')}
        />
      </Box>
    </Box>
    <Schema data={data} schema={response.schema} />
  </Box>
);

const Method = ({
  contextSearch, data, method, methodName, path, subPath,
}) => (
  <Box key={methodName}>
    <Box>
      <Heading level={2}>
        <RoutedButton
          path={`/execute${contextSearch}&${searchString({ path, subPath, methodName })}`}
          fill={true}
        >
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
            <LinkNext color='brand' />
          </Box>
        </RoutedButton>
      </Heading>
      <Markdown
        content={(method.description || '').replace(new RegExp('</BR>', 'gi'), '\n\n')}
      />
    </Box>
    <Box margin={{ bottom: 'medium' }}>
      <Parameters
        data={data}
        label='Path Parameters'
        parameters={(method.parameters || []).filter(p => p.in === 'path')}
      />
      <Parameters
        data={data}
        label='Query Parameters'
        parameters={(method.parameters || []).filter(p => p.in === 'query')}
      />
      <Parameters
        data={data}
        label='Body Parameters'
        parameters={(method.parameters || []).filter(p => p.in === 'body')}
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

export default class extends Component {
  state = {};

  render() {
    const { contextSearch, data, path } = this.props;
    const { responsive } = this.state;
    return (
      <Responsive
        onChange={nextResponsive => this.setState({ responsive: nextResponsive })}
      >
        <Box direction='row' justify='center' responsive={true}>
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
                    method={data.paths[subPath][methodName]}
                    methodName={methodName}
                    path={path}
                    subPath={subPath}
                  />
                )))}
          </Box>
          <Nav contextSearch={contextSearch} data={data} />
        </Box>
      </Responsive>
    );
  }
}
