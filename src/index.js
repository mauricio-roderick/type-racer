import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
// import errorLog from '@services/errorLog';

const Root = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

const bootstrap = async () => {
  // await errorLog();

  render(<Root />, document.getElementById('root'));
};

bootstrap();