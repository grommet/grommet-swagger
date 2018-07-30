import React from 'react';
import { Markdown as GrommetMarkdown } from 'grommet';

const Markdown = ({ children, ...rest }) => (
  <GrommetMarkdown
    options={{
      overrides: {
        em: {
          // Don't apply markdown styling to underscore variables i.e. omnistack_cluster_id
          component: ({ children: childString }) => `_${childString.toString()}_`,
        },
      },
    }}
    {...rest}
  >
    {children || ''}
  </GrommetMarkdown>);

export default Markdown;
