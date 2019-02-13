import { hpe } from 'grommet-theme-hpe';
import { deepMerge } from 'grommet/utils';

const theme = deepMerge(hpe, {
  grommet: {
    extend: 'display: flex; flex-direction: column;',
  },
});

export default theme;
