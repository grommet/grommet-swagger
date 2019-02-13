import React from 'react';
import PropTypes from 'prop-types';
import { Box, ResponsiveContext } from 'grommet';
import Nav from './Nav';

const WithNav = ({
  background, contextSearch, data, children,
}) => (
  <ResponsiveContext.Consumer>
    {(responsive = 'wide') => (
      <Box full={true} background={background || 'white'}>
        <Box
          alignSelf='center'
          direction='row-responsive'
        >
          <Box
            basis={responsive === 'wide' ? 'xlarge' : undefined}
            flex='shrink'
            pad='large'
            width='xlarge'
            style={{ minWidth: 0 }}
          >
            {children}
          </Box>
          <Nav contextSearch={contextSearch} data={data} />
        </Box>
      </Box>)}
  </ResponsiveContext.Consumer>);

WithNav.propTypes = {
  background: PropTypes.oneOfType([
    PropTypes.shape({ image: PropTypes.string, dark: PropTypes.bool }),
    PropTypes.string,
  ]),
  children: PropTypes.node.isRequired,
  contextSearch: PropTypes.string,
  data: PropTypes.object,
};

export default WithNav;
