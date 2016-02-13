import 'babel-polyfill';
import ReactDOM from 'react-dom';
import React from 'react';
import './styles.css';
import Homepage from './components/homepage';
import Manager from '../vddf/manager';
import ReactRenderer from '../vddf-react/renderer';

window.addEventListener('load', () => {
  let renderer = new ReactRenderer();
  renderer.loadResources();

  let manager = new Manager({
    renderer: renderer,
    baseUrl: window.location.origin
  });

  ReactDOM.render(<Homepage manager={manager} />, document.getElementById('app'));
});
