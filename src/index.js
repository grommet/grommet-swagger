import React from 'react';
import ReactDOM from 'react-dom';

import GrommetSwagger from './GrommetSwagger';

const element = document.getElementById('root');
ReactDOM.render(<GrommetSwagger
  url={(document.getElementsByName('grommet-swagger-url')[0] || {}).content}
  theme={(document.getElementsByName('grommet-swagger-theme')[0] || {}).content}
/>, element);

document.body.classList.remove('loading');
document.body.style.margin = 0;
