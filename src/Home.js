import React from 'react';

import { Anchor, Box, Heading, Markdown, RoutedButton, Text } from 'grommet';

export default ({ data }) => (
  <Box>
    <Box pad={{ horizontal: 'large', vertical: 'medium' }} background='neutral-1'>
      <Heading level={1} margin='none'>{data.info.title}</Heading>
    </Box>
    <Box pad={{ horizontal: 'large', vertical: 'medium' }}>
      <Markdown content={(data.info.description || '').replace(new RegExp('</BR>', 'g'), '\n\n')} />
    </Box>
    <Box pad={{ vertical: 'medium' }}>
      {Object.keys(data.paths).sort().filter(path => path.split('/').length === 2).map(path => (
        <RoutedButton key={path} path={`/endpoint?path=${encodeURIComponent(path)}`} hoverIndicator={true}>
          <Box pad={{ horizontal: 'large', vertical: 'xsmall' }}>
            <Text size='large'>{path.substr(1)}</Text>
          </Box>
        </RoutedButton>
      ))}
    </Box>
    <Box pad={{ horizontal: 'large', vertical: 'medium' }} background='light-2'>
      <Anchor href={data.termsOfService} label='Terms of Service' />
    </Box>
  </Box>
);
