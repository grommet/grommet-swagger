import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import hljs from 'highlight.js';
import { RoutedAnchor, Box, Heading, Markdown, Responsive, RoutedButton, Text } from 'grommet';
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
    const { data, label, schema } = this.props;
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
              {JSON.stringify(definitionToJson(data, schema), null, 2)}
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
          {(parameter.description || '')
            .replace(new RegExp('</BR>', 'gi'), '\n\n')}
        </Markdown>
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


const parseSchemaName = (ref) => {
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
          {(response.description || '')
            .replace(new RegExp('</BR>', 'gi'), '\n\n')}
        </Markdown>
      </Box>
    </Box>
    {response.schema &&
      <Box direction='column' align='start' pad={{ bottom: 'small' }}>
        <RoutedAnchor
          label={parseSchemaName(response.schema.$ref)}
          path={`/definition/${parseSchemaName(response.schema.$ref).toLowerCase()}`}
        />
      </Box>
    }
    {response.examples ?
      Object.keys(response.examples).map(key =>
        <Schema key={key} label={key} data={data} schema={response.examples[key]} />)
      :
      <Schema data={data} schema={response.schema} />
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
              {(method.summary).replace(new RegExp('</BR>', 'gi'), '\n\n')}
            </Markdown>
          }
          { method && method.description &&
            <Markdown>
              {(method.description).replace(new RegExp('</BR>', 'gi'), '\n\n')}
            </Markdown>
          }
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
  }
}

export default class Endpoint extends Component {
  state = { responsive: 'wide' };

  render() {
    const {
      contextSearch, data, executable, path,
    } = this.props;
    const { responsive } = this.state;
    return (
      <Responsive
        onChange={nextResponsive => this.setState({ responsive: nextResponsive })}
      >
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
        </Box>
      </Responsive>
    );
  }
}

Endpoint.propTypes = {
  contextSearch: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  executable: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
};
