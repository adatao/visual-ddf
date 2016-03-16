import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/sidebar';
import Events from './events';
import { loadMaterialFonts } from './utils';
import './common.css';
import './sidebar.css';
import { getSource } from 'src/browser/lib/svg-crowbar2-es6';
import { extractD3Data } from './extractor';
import Manager from 'src/vddf/manager';

let store = {};

loadMaterialFonts();

document.addEventListener(Events.PageActionClicked, (e) => {
  const allSvgs = [].slice.call(document.querySelectorAll('svg'));

  store.baseUrl = e.detail.baseUrl;
  store.serverUrl = e.detail.serverUrl;

  // scan all charts and add to sidebar
  // these charts have been detected earlier with a __d3__ flag
  store.charts = allSvgs.filter(e => e.__d3__).map(e => {
    e.setAttribute('version', '1.1');
    e.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const source = getSource(e).source[0];

    return {
      node: e,
      svg: source,
      svgDataUrl: 'data:image/svg+xml;base64,' + btoa(source)
    };
  });

  renderSidebar();
});

function closeSidebar() {
  let el = document.getElementById('vddf-sidebar');

  if (el) {
    el.parentElement.removeChild(el);
  }
}

function submitCharts(charts) {
  const manager = new Manager({baseUrl: store.serverUrl});

  const promises = charts.map(c => {
    const detect = extractD3Data(c.node);
    const candidate = detect.candidate;
    const count = candidate.data[candidate.schema[0]].length;

    // convert to vddf schema
    const data = [];
    const schema = candidate.schema.map(c => ({name: c}));

    for (let i = 0; i < count; i++) {
      const row = [];

      schema.forEach(c => {
        row.push(candidate.data[c.name][i] || null);
      });

      data.push(row);
    }

    return manager.load({
      schema,
      data,
      source: window.location + ''
    }).then(vddf => {
      return manager.export(vddf);
    }).then(result => {
      // TODO: tell browser to remember it
      // also submit svg to server

      console.log(result);
    }).catch(err => {
      console.log('There was an error', err.stack);
      throw err;
    });
  });

  Promise.all(promises).then(() => {
    closeSidebar();
    Events.dispatch(Events.SubmissionDone);
  }).catch(err => {
    // TODO: error handling
    console.log('Fail to submit all charts');
  });
}

export function renderSidebar() {
  let el = document.getElementById('vddf-sidebar');

  if (!el) {
    el = document.createElement('div');
    el.setAttribute('id', 'vddf-sidebar');
    document.body.appendChild(el);
  }

  ReactDOM.render(<Sidebar baseUrl={store.baseUrl} onSubmit={submitCharts}  charts={store.charts} closeSidebar={closeSidebar} />, el);
}
