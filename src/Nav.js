import React from 'react';
import { Box, RoutedButton, Text } from 'grommet';

export default ({ contextSearch, data }) => (
  <Box flex={false} basis='medium'>
    <Box pad={{ vertical: 'large' }}>
      <RoutedButton
        key='api'
        path={`/${contextSearch}`}
        hoverIndicator={true}
      >
        <Box pad={{ horizontal: 'medium', vertical: 'small' }}>
          <Text size='large'>{data.info.title}</Text>
        </Box>
      </RoutedButton>
      {Object.keys(data.paths).sort().filter(path => path.split('/').length === 2).map(path => (
        <RoutedButton
          key={path}
          path={`/endpoint${contextSearch}&path=${encodeURIComponent(path)}`}
          hoverIndicator={true}
        >
          <Box pad={{ horizontal: 'medium', vertical: 'xsmall' }}>
            <Text size='large'>{path.substr(1)}</Text>
          </Box>
        </RoutedButton>
      ))}
    </Box>
  </Box>
);
