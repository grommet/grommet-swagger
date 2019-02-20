import { RoutedAnchor, Box, Heading, Markdown, RoutedButton, Text } from 'grommet';
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import hljs from 'highlight.js';
import { LinkNext } from 'grommet-icons';
import WithNav from './WithNav';
import { sanitizeForMarkdown, searchString } from './utils';
// import { SCHEMES } from 'uri-js';

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

const callParser = (res) => {
  let example = {};
  /* Params:
    schema(Object) - response object
    keyName(String) - tracks depth and postion of previous function call.
      needed for properties that have arrays or, in some cases, objects as values.
  */
  const parseExample = (schema, keyName, dataType) => {
    // if allOf property exists then recurse
    if (schema.allOf) {
      return schema.allOf.map(data => parseExample(data, keyName, dataType));
    }
    // if example property exists add to example object
    if (schema.example) {
      example = { ...example, [keyName]: schema.example };
      return example;
    }
    if (schema.properties) {
      const schemaProps = schema.properties;
      // if keyName has a value recurisve function has been called at least once.
      if (keyName) {
        // temp values to add to example object
        let chunk = {};
        let nestedChunk = {};
        let joinedEnum = '';
        Object.keys(schemaProps).map((key) => {
          // if object.type is 'array' and object.items.properties exists,
          // nested values exist and need to be mapped through before adding to chunk.
          if (schemaProps[key].type === 'array' && schemaProps[key].items.properties) {
            nestedChunk = {};
            Object.keys(schemaProps[key].items.properties).map((prop) => {
              // if enum prop exists join and add to nested chunk instead of type.
              if (schemaProps[key].items.properties[prop].enum) {
                joinedEnum = schemaProps[key].items.properties[prop].enum.join('|');
                nestedChunk = {
                  ...nestedChunk, [prop]: joinedEnum,
                };
                return prop;
              }
              nestedChunk = {
                ...nestedChunk, [prop]: schemaProps[key].items.properties[prop].type,
              };
              return prop;
            });
            chunk = { ...chunk, [key]: [nestedChunk] };

            return chunk;
          }
          // if object.type is 'object' and object.properties exists,
          // nested values exist and need to be mapped through before adding to chunk.
          if (schemaProps[key].type === 'object' && schemaProps[key].properties) {
            // temp value to add to chunk
            nestedChunk = {};
            Object.keys(schemaProps[key].properties).map((prop) => {
              nestedChunk = {
                ...nestedChunk, [prop]: schemaProps[key].properties[prop].type,
              };
              return prop;
            });
            chunk = { ...chunk, [key]: nestedChunk };
            return chunk;
          }
          // check for enum property
          if (schemaProps[key].enum) {
            joinedEnum = schemaProps[key].enum.join('|');
            chunk = { ...chunk, [key]: joinedEnum };
            return chunk;
          }
          // if neither checks pass
          chunk = { ...chunk, [key]: schemaProps[key].type };
          return chunk;
        });
        // once all checks have been made
        // add to example object
        if (dataType === 'array') {
          example = { ...example, [keyName]: [chunk] };
          return example;
        }
        example = { ...example, [keyName]: chunk };
        return example;
      }
      // if schema.properties exist but keyName is null
      // map through properties and call recursive function on each
      return Object.keys(schemaProps)
        .map(key => parseExample(schemaProps[key], key, schemaProps[key].type));
    }
    if (schema.enum) {
      const joinedEnum = schema.enum.join('|');
      example = { ...example, [keyName]: joinedEnum };
      return example;
    }
    if (schema.items) {
      if (schema.items.allOf) {
        let chunk = {};
        return schema.items.allOf.map((data) => {
          // if items.allOf has properties key
          // use properties for example object
          if (data.properties) {
            Object.keys(data.properties).map((key) => {
              chunk = { ...chunk, [key]: data.properties[key].type };
              return chunk;
            });
          }
          example = { ...example, [keyName]: chunk };
          return example;
        });
      }
      // if allOf.properties does not exist recurse
      return parseExample(schema.items, keyName, dataType);
    }
    // end condition
    if (!schema.properties && !schema.allOf) {
      if (dataType === 'array') {
        example = { ...example, [keyName]: [schema.type] };
        return example;
      }
      example = { ...example, [keyName]: schema.type };
      return example;
    }
    return example;
  };
  // first call of recursive function
  parseExample(res, null, null);
  return example;
};

const getExample = (res) => {
  if (res.schema) {
    if (res.schema.example) {
      return res.schema.example;
    }
    if (res.schema.allOf || res.schema.properties) {
      return callParser(res.schema);
    }
  } else {
    return res.schema;
  }
  return res;
};

const Parameter = ({ data, parameter, first }) => (
  <Box border={first ? 'horizontal' : 'bottom'} pad={{ vertical: 'medium' }}>
    <Box direction='row' pad={{ bottom: 'small' }} wrap={true}>
      <Box basis={parameter.name && parameter.name.length > 30 ? 'large' : 'medium'} pad={{ right: 'medium' }}>
        <Heading level={3} size='small' margin={{ vertical: 'small' }}>
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
    <Schema data={data} schema={getExample(parameter)} />
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
  if (!ref || ref.indexOf('/') === -1) return undefined;
  const name = ref.split('/');
  return name[name.length - 1];
};

const Response = ({
  data, refs, name, response, first,
}) => (
  <Box border={first ? 'horizontal' : 'bottom'} pad={{ vertical: 'medium' }}>
    <Box direction='row' pad={{ bottom: 'small' }} align='end'>
      <Box basis='xxsmall'>
        <Heading level={3} size='small' margin={{ vertical: 'small' }}>
          <strong><code>{name}</code></strong>
        </Heading>
      </Box>
      <Box flex={true} pad={{ horizontal: 'small' }} margin={{ vertical: 'small' }}>
        <Markdown>
          {sanitizeForMarkdown(response.description)}
        </Markdown>
      </Box>
    </Box>
    {refs.schema && parseSchemaName(refs.schema.$ref) &&
      <Box direction='column' align='start' pad={{ bottom: 'medium' }}>
        <Text>
          {'returns '}
          <strong>
            <RoutedAnchor
              label={parseSchemaName(refs.schema.$ref)}
              path={`/definition?name=${parseSchemaName(refs.schema.$ref)}`}
            />
          </strong>
        </Text>
      </Box>
    }
    {response.examples ?
      Object.keys(response.examples).map(key =>
        <Schema key={key} label={key} data={data} schema={response.examples[key]} />)
      :
      <Schema data={data} schema={getExample(response)} />
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
      contextSearch, data, refs, executable, method, methodName, path, subPath,
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
            parameters={method.parameters || []}
          />
          <Heading level={2}>Responses</Heading>
          {Object.keys(method.responses).map((responseName, index) => (
            <Response
              key={responseName}
              data={data}
              refs={refs.paths[subPath][methodName].responses[responseName]}
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
      contextSearch, data, refs, executable, path,
    } = this.props;
    return (
      <WithNav contextSearch={contextSearch} data={data}>
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
                refs={refs}
                executable={executable}
                method={data.paths[subPath][methodName]}
                methodName={methodName}
                path={path}
                subPath={subPath}
              />
            )))}
      </WithNav>
    );
  }
}

Endpoint.propTypes = {
  contextSearch: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  executable: PropTypes.bool.isRequired,
  path: PropTypes.string.isRequired,
};
