import React from 'react';

import { Anchor, Box, Button, Heading, Markdown, RoutedButton, Text } from 'grommet';
import { Eject as UnloadIcon } from 'grommet-icons';

export default ({ contextSearch, data, onUnload }) => (
  <div>
    <Box
      direction='row'
      align='center'
      justify='between'
      pad={{ horizontal: 'xlarge', vertical: 'medium' }}
      background='neutral-1'
    >
      <Box pad={{ right: 'medium' }}>
        <Heading level={1} margin='none'>{data.info.title}</Heading>
      </Box>
      <Button icon={<UnloadIcon color='light-1' />} onClick={onUnload} />
    </Box>
    <Box margin={{ horizontal: 'xlarge', vertical: 'medium' }}>
      <Markdown content={(data.info.description || '').replace(new RegExp('</BR>', 'gi'), '\n\n')} />
    </Box>
    <Box margin={{ top: 'medium', bottom: 'xlarge' }}>
      {Object.keys(data.paths).sort().filter(path => path.split('/').length === 2).map(path => (
        <RoutedButton
          key={path}
          path={`/endpoint${contextSearch}&path=${encodeURIComponent(path)}`}
          hoverIndicator={true}
        >
          <Box pad={{ horizontal: 'xlarge', vertical: 'xsmall' }}>
            <Text size='large'>{path.substr(1)}</Text>
          </Box>
        </RoutedButton>
      ))}
    </Box>
    <Box pad={{ horizontal: 'xlarge', vertical: 'medium' }} background='light-2'>
      <Anchor href={data.termsOfService} label='Terms of Service' />
    </Box>
  </div>
);
