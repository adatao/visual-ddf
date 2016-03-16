import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/sidebar';
import Events from './events';
import { loadMaterialFonts } from './utils';
import './common.css';
import './sidebar.css';
import { getSource } from 'src/browser/lib/svg-crowbar2-es6';


let store = {};

loadMaterialFonts();

document.addEventListener(Events.PageActionClicked, (e) => {
  const allSvgs = [].slice.call(document.querySelectorAll('svg'));

  // scan all charts and add to sidebar
  store.baseUrl = e.detail.baseUrl;
  store.charts = allSvgs.filter(e => e.__d3__).map(e => {
    e.setAttribute('version', '1.1');
    e.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const source = getSource(e).source[0];

    return {
      svg: source,
      svgDataUrl: 'data:image/svg+xml;base64,' + btoa(source)
    };
  });

  // grap all available charts

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

  ReactDOM.render(<Sidebar baseUrl={store.baseUrl} charts={store.charts} closeSidebar={closeSidebar} />, el);
}
