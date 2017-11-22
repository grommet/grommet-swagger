import React, { Component } from 'react';

import { Box } from 'grommet';

export default class extends Component {
  state = { animation: 'fadeIn' }

  onAnimationEnd = () => {
    const { animation } = this.state;
    this.setState({ animation: (animation === 'fadeIn' ? 'fadeOut' : 'fadeIn') });
  }

  render() {
    const { animation } = this.state;
    return (
      <Box
        direction='row'
        full={true}
        justify='center'
        align='center'
        pad='large'
      >
        <Box
          background='light-2'
          pad='large'
          margin='small'
          round='full'
          animation={{ type: animation, duration: 1000, delay: 100 }}
          onAnimationEnd={this.onAnimationEnd}
        />
        <Box
          background='light-2'
          pad='large'
          margin='small'
          round='full'
          animation={{ type: animation, duration: 1000, delay: 400 }}
        />
        <Box
          background='light-2'
          pad='large'
          margin='small'
          round='full'
          animation={{ type: animation, duration: 1000, delay: 700 }}
        />
      </Box>
    );
  }
}
