import 'babel-polyfill';
import ReactDOM from 'react-dom';
import React from 'react';
import './styles.css';
import Homepage from './components/homepage';
import Manager from '../vddf-react/manager';
import FileLoader from '../vddf-react/loaders/file';

window.addEventListener('load', () => {

  let manager = new Manager({
    baseUrl: window.location.origin
  });

  manager.addLoader(new FileLoader());
  ReactDOM.render(<Homepage manager={manager} />, document.getElementById('app'));
});
