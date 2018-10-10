import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Heading, Markdown, ResponsiveContext, Text } from 'grommet';
import { sanitizeForMarkdown } from './utils';
import Nav from './Nav';

const isRequired = (name, definitions) => definitions.find(singleName => name === singleName);

export default class Definition extends Component {
  render() {
    const { contextSearch, data, name } = this.props;
    const definitions = name && data.definitions && data.definitions[name];
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
                <Heading level={1} margin='none'>{name}</Heading>
              </Box>
              <Box pad={{ vertical: 'medium' }}>
                { definitions && definitions.properties &&
                  Object.keys(definitions.properties).map(property => (
                    <Box
                      key={property}
                      direction='row-responsive'
                      pad={{ vertical: 'medium' }}
                      border='bottom'
                    >
                      <Box basis={property.length > 30 ? 'large' : 'medium'} pad={{ right: 'medium' }}>
                        <Heading level={3} size='small' margin='small'>
                          <strong><code>{property}</code></strong>
                        </Heading>
                      </Box>
                      <Box basis='medium' pad={{ right: 'medium', bottom: 'medium' }}>
                        <Markdown>
                          {sanitizeForMarkdown(definitions.properties[property].description)}
                        </Markdown>
                        {definitions.properties[property].type ? <Text color='dark-5'>{definitions.properties[property].type}</Text> : null}
                        {isRequired(property, definitions.required) ? <Text color='dark-5'>required</Text> : null}
                      </Box>
                    </Box>))
                }
              </Box>
            </Box>
            <Nav contextSearch={contextSearch} data={data} />
          </Box>)}
      </ResponsiveContext.Consumer>
    );
  }
}

Definition.propTypes = {
  contextSearch: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
};
