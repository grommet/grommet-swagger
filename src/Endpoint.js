import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import hljs from 'highlight.js';

import { Box, Heading, Markdown, RoutedButton } from 'grommet';
import { Previous as BackIcon } from 'grommet-icons';

const getRef = (data, path) => {
  const parts = path.split('/');
  let node = data;
  while (parts.length) {
    const element = parts.shift();
    if (element === '#') {
      node = data;
    } else {
      node = node[element];
    }
  }
  return node;
};

const definitionToJson = (data, def, visited = {}) => {
  // avoid endless recursion
  const nextVisited = { ...visited };
  if (def.$ref) {
    if (visited[def.$ref]) {
      return def.$ref;
    }
    nextVisited[def.$ref] = true;
  }

  const definition = def.$ref ? getRef(data, def.$ref) : def;
  if (definition.type === 'array') {
    return [definitionToJson(data, definition.items, nextVisited)];
  } else if (definition.properties) {
    const result = {};
    Object.keys(definition.properties).forEach((name) => {
      result[name] = definitionToJson(data, definition.properties[name], nextVisited);
    });
    return result;
  } else if (definition.enum) {
    return definition.enum.join('|');
  }
  return definition.type;
};

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
        <pre><code ref={(ref) => { this.ref = ref; }} className='json'>{JSON.stringify(definitionToJson(data, schema), null, 2)}</code></pre>
      </Box>
    );
  }
}

const Parameter = ({ data, parameter, first }) => (
  <Box
    direction='row'
    border={first ? 'horizontal' : 'bottom'}
    align='start'
    pad={{ vertical: 'small' }}
  >
    <Box basis='small'>
      <Heading level={3} size='small' margin='small'>
        <strong><code>{parameter.name}</code></strong>
      </Heading>
    </Box>
    <Box flex={true} pad={{ horizontal: 'medium' }}>
      <Markdown content={(parameter.description || '').replace(new RegExp('</BR>', 'gi'), '\n\n')} />
    </Box>
    <Schema data={data} schema={parameter.schema} />
  </Box>
);

const Response = ({
  data, name, response, first,
}) => (
  <Box
    direction='row'
    border={first ? 'horizontal' : 'bottom'}
    align='start'
    pad={{ vertical: 'small' }}
  >
    <Box basis='small'>
      <Heading level={3} size='small' margin='small'>
        <strong><code>{name}</code></strong>
      </Heading>
    </Box>
    <Box flex={true} pad={{ horizontal: 'medium' }}>
      <Markdown content={(response.description || '').replace(new RegExp('</BR>', 'gi'), '\n\n')} />
    </Box>
    <Schema data={data} schema={response.schema} />
  </Box>
);

export default ({ contextSearch, data, path }) => (
  <Box>
    <Box
      direction='row'
      justify='between'
      align='center'
      pad={{ horizontal: 'small', vertical: 'medium' }}
      background='neutral-1'
    >
      <RoutedButton path={`/${contextSearch}`} icon={<BackIcon color='light-1' />} />
      <Box pad={{ horizontal: 'medium' }}>
        <Heading level={1} margin='none'>{path.substr(1)}</Heading>
      </Box>
      <Box pad='medium' />
    </Box>
    {Object.keys(data.paths)
      // everything that starts with the path we have
      .filter(p => (p === path || p.substr(0, path.length + 1) === `${path}/`))
      .map(subPath =>
        Object.keys(data.paths[subPath])
        .map((methodName) => {
        const method = data.paths[subPath][methodName];
        return (
          <Box key={methodName}>
            <Box pad={{ horizontal: 'xlarge', vertical: 'medium' }} background='light-2'>
              <Heading level={2} margin='none'>
                <strong>{methodName.toUpperCase()}</strong> {subPath}
              </Heading>
              <Markdown
                content={(method.description || '').replace(new RegExp('</BR>', 'gi'), '\n\n')}
              />
            </Box>
            <Box pad={{ horizontal: 'xlarge' }} margin={{ bottom: 'large' }}>
              <Heading level={2}>Parameters</Heading>
              {(method.parameters || []).map((parameter, index) => (
                <Parameter
                  key={parameter.name}
                  data={data}
                  parameter={parameter}
                  first={index === 0}
                />
              ))}
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
      }))}
  </Box>
);
