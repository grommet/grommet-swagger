import React, { Component } from 'react';

import { Box, Button, Select, Text, TextInput } from 'grommet';

export default class Choose extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { theme: props.theme, url: props.url || '' };
  }

  onSubmit = (event) => {
    const { onLoad } = this.props;
    const { theme, url } = this.state;
    event.preventDefault();
    onLoad(url, theme);
  }

  render() {
    const { error, loading } = this.props;
    const { theme, url } = this.state;
    return (
      <form onSubmit={this.onSubmit}>
        <Box
          align='stretch'
          pad={{ horizontal: 'large', vertical: 'xlarge' }}
        >
          <Box margin='medium' border='bottom'>
            <TextInput
              placeholder='Swagger URL'
              size='xlarge'
              plain={true}
              value={url}
              onInput={event => this.setState({ url: event.target.value })}
            />
          </Box>
          <Box margin='medium'>
            <Select
              placeholder='Theme'
              plain={true}
              value={theme}
              options={['grommet', 'hpe']}
              onChange={event => this.setState({ theme: event.option })}
            />
          </Box>
          <Box margin='medium'>
            <Button
              primary={true}
              type='submit'
              label='Load'
              disabled={loading}
            />
          </Box>
          <Box margin='medium'>
            <Text color='status-critical' size='large'>{error}</Text>
          </Box>
        </Box>
      </form>
    );
  }
}
