import React from 'react';

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

// const refToJson = (data, path) => {
//   console.log('!!! refToJson', path);
//   const definition = getRef(data, path);
//   return definitionToJson(data, definition);
// };

const definitionToJson = (data, def) => {
  const definition = def.$ref ? getRef(data, def.$ref) : def;
  console.log('!!! definitionToJson', def.$ref, definition);
  if (definition.type === 'array') {
    return [definitionToJson(data, definition.items)];
  } else if (definition.properties) {
    const result = {};
    Object.keys(definition.properties).forEach((name) => {
      result[name] = definitionToJson(data, definition.properties[name]);
    });
    return result;
  } else if (definition.enum) {
    return definition.enum.join('|');
  }
  return definition.type;
};

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
      <Markdown content={parameter.description} />
    </Box>
    {parameter.schema ? (
      <Box flex={true} background='light-1' pad={{ horizontal: 'small' }}>
        <pre>{JSON.stringify(definitionToJson(data, parameter.schema), null, 2)}</pre>
      </Box>
    ) : null}
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
      <Markdown content={response.description} />
    </Box>
    {response.schema ? (
      <Box flex={true} background='light-1' pad={{ horizontal: 'small' }}>
        <pre>{JSON.stringify(definitionToJson(data, response.schema), null, 2)}</pre>
      </Box>
    ) : null}
  </Box>
);

export default ({ data, path }) => (
  <Box>
    <Box
      direction='row'
      align='center'
      pad={{ horizontal: 'small', vertical: 'medium' }}
      background='neutral-1'
    >
      <RoutedButton path='/' icon={<BackIcon />} />
      <Box pad={{ horizontal: 'medium' }}>
        <Heading level={1} margin='none'>{path.substr(1)}</Heading>
      </Box>
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
            <Box pad={{ horizontal: 'xlarge', vertical: 'small' }} background='light-2'>
              <Heading level={2} margin='none'>
                <strong>{methodName.toUpperCase()}</strong> {subPath}
              </Heading>
              <Markdown content={method.description} />
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
