import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/sidebar';
import Events from './events';
import { loadMaterialFonts } from './utils';
import './common.css';
import './sidebar.css';


let store = {};

loadMaterialFonts();

document.addEventListener(Events.PageActionClicked, (e) => {
  // scan all charts and add to sidebar
  store.baseUrl = e.detail.baseUrl;

  renderSidebar();
});

function closeSidebar() {
  let el = document.getElementById('vddf-sidebar');

  if (el) {
    el.parentElement.removeChild(el);
  }
}

export function renderSidebar() {
  let el = document.getElementById('vddf-sidebar');

  if (!el) {
    el = document.createElement('div');
    el.setAttribute('id', 'vddf-sidebar');
    document.body.appendChild(el);
  }

  ReactDOM.render(<Sidebar baseUrl={store.baseUrl} closeSidebar={closeSidebar} />, el);
}
