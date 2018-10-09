import 'whatwg-fetch';
import '@babel/polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import GrommetSwagger from './GrommetSwagger';

const mount = (domId, props) => {
  ReactDOM.render(
    React.createElement(GrommetSwagger, props, null),
    document.getElementById(domId)
  );
};

export { GrommetSwagger, mount };
