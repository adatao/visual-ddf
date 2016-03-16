import React from 'react';
import ReactDOM from 'react-dom';
import Directory from './components/directory';
import { loadMaterialFonts } from './utils';
import 'flexboxgrid';
import './common.css';
import './app.css';

loadMaterialFonts();

window.addEventListener('load', () => {
  ReactDOM.render(
    <Directory />,
    document.getElementById('app')
  );
});
