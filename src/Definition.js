import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Box, Heading, Markdown, Responsive, Text } from 'grommet';
import Nav from './Nav';

export default class Definition extends Component {
  state = { responsive: 'wide' };

  render() {
    const { contextSearch, data, name } = this.props;
    const { responsive } = this.state;
    const definitions = name && data.definitions && data.definitions[name];
    console.log(definitions);
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
              <Heading level={1} margin='none'>{name}</Heading>
            </Box>
            <Box pad={{ vertical: 'medium' }}>
              { definitions && definitions.properties &&
                Object.keys(definitions.properties).map(property => (
                  <Box direction='row-responsive' key={property}>
                    <Heading level={3} size='small' margin='small'>
                      <strong><code>{property.toString()}</code></strong>
                    </Heading>
                    <Box basis='medium' pad={{ right: 'medium' }}>
                      <Markdown>
                        {` `} 
                        {/* (parameter.description || '')
                          .replace(new RegExp('</BR>', 'gi'), '\n\n') */}
                      </Markdown>
                      {/* parameter.type !== 'string' ? <Text color='dark-5'>{parameter.type}</Text> : null */}
                      {/* parameter.required ? <Text color='dark-5'>required</Text> : null */}
                    </Box>
                  </Box>))
              }
            </Box>
          </Box>
          <Nav contextSearch={contextSearch} data={data} />
        </Box>
      </Responsive>
    );
  }
}

Definition.propTypes = {
  contextSearch: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
};
