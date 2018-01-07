import React, { Component } from 'react';
import { Anchor, Box, Button, Heading, Markdown, Responsive } from 'grommet';
import { Eject as UnloadIcon } from 'grommet-icons';
import Nav from './Nav';

export default class extends Component {
  state = { responsive: 'wide' };

  render() {
    const {
      background, contextSearch, data, onUnload,
    } = this.props;
    const { responsive } = this.state;
    return (
      <Responsive
        onChange={nextResponsive => this.setState({ responsive: nextResponsive })}
      >
        <Box
          direction='row'
          responsive={true}
          justify='center'
          background={background || 'neutral-1'}
        >
          <Box
            basis={responsive === 'wide' ? 'xlarge' : undefined}
            flex='shrink'
            justify='between'
            pad='large'
            style={{ minWidth: 0 }}
          >
            <Box pad={{ vertical: 'xlarge' }}>
              <Heading level={1} margin='none'><strong>{data.info.title}</strong></Heading>
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
      </Responsive>
    );
  }
}
