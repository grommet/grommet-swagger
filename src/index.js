import React from 'react';
import ReactDOM from 'react-dom';

import GrommetSwagger from './GrommetSwagger';

const backgroundImage =
  (document.getElementsByName('grommet-swagger-background-image')[0] || {}).content;
const backgroundDark =
  (document.getElementsByName('grommet-swagger-background-image')[0] || {}).content;
const background =
  backgroundImage ? { image: `url(${backgroundImage})`, dark: backgroundDark } : undefined;


const element = document.getElementById('content');
ReactDOM.render(<GrommetSwagger
  routePrefix={(document.getElementsByName('grommet-swagger-route-prefix')[0] || {}).content}
  url={(document.getElementsByName('grommet-swagger-url')[0] || {}).content}
  theme={(document.getElementsByName('grommet-swagger-theme')[0] || {}).content}
  background={background}
/>, element);

document.body.classList.remove('loading');
document.body.style.margin = 0;
