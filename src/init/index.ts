import './styles';
import '@babel/polyfill';

import { render } from 'react-dom';
import { createElement } from 'react';

import { App } from './app';

render(
    createElement(App),
    document.getElementById('root')!,
);
