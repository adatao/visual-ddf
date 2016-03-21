// import { createDragHandle } from './dragHandler';
import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/sidebar';
import Events from './events';
import { loadMaterialFonts } from 'src/browser/utils';
import { detectSources, extractSource, previewSource } from './extractor';
import '../vddf-react/common.css';
import './sidebar.css';

let store = {
  sources: []
};

loadMaterialFonts();

document.addEventListener(Events.PageActionClicked, (e) => {
  store.baseUrl = e.detail.baseUrl;
  store.serverUrl = e.detail.serverUrl;

  // now preview source
  store.charts = store.sources
    .map(previewSource);

  renderSidebar();
});

function closeSidebar() {
  let el = document.getElementById('vddf-sidebar');

  if (el) {
    el.parentElement.removeChild(el);
  }
}

function submitCharts(charts) {
  const promises = charts.map(source => {
    let schema, data;

    return extractSource(source)
      .then(result => {
        schema = result.schema;
        data = result.data;

        const payload = {
          title: source.title,
          name: source.name,
          source: window.location + '',
          preview: source.previewUrl,
          svg: source.svg,
          data,
          schema
        };

        Events.dispatch(Events.SaveChart, null, {data: payload});

        return payload;
      })
      .catch(err => {
        console.log('There was an error submit', {schema, data}, err.stack);
        throw err;
      });
  });

  Promise.all(promises).then(() => {
    closeSidebar();
    Events.dispatch(Events.SubmissionDone);
  }).catch(err => {
    // TODO: error handling
    console.log('Fail to submit all charts', err);
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

function init() {
  detectSources(document)
    .then(sources => {
      store.sources = sources;
      const found = sources.length;
      console.log(`Detect ${found} available charts`);

      // trigger the done event
      if (found) {
        Events.dispatch(Events.DetectionReady);
      }
    });
}

// it may took a while for the chart to  be draw, so delay a bit before start rendering
setTimeout(() => {
  init();
}, 2000); // TODO: change to 2s later
