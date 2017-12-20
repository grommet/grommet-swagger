import React from 'react';
import { Anchor, Box, Button, Heading, Markdown } from 'grommet';
import { Eject as UnloadIcon } from 'grommet-icons';
import Nav from './Nav';

export default ({ contextSearch, data, onUnload }) => (
  <Box
    direction='row'
    responsive={true}
    background='neutral-1'
  >
    <Box basis='3/4' flex={false} justify='between' pad='large'>
      <Box pad={{ vertical: 'xlarge' }}>
        <Heading level={1} margin='none'>{data.info.title}</Heading>
        <Box pad={{ vertical: 'large' }}>
          <Markdown content={(data.info.description || '').replace(new RegExp('</BR>', 'gi'), '\n\n')} />
        </Box>
      </Box>
      <Box direction='row' justify='between' align='center'>
        <Anchor href={data.termsOfService} label='Terms of Service' />
        {
          onUnload ?
            <Button icon={<UnloadIcon color='light-1' />} onClick={onUnload} /> :
            <span />
        }
      </Box>
    </Box>
    <Nav contextSearch={contextSearch} data={data} />
  </Box>
);
