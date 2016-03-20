import $ from 'jQuery';
// import { createDragHandle } from './dragHandler';
import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/sidebar';
import Events from './events';
import { loadMaterialFonts } from 'src/browser/utils';
import './common.css';
import './sidebar.css';
import { detectSources, extractSource, previewSource } from './extractor';
import Manager from 'src/vddf/manager';

let store = {
  sources: []
};

loadMaterialFonts();

document.addEventListener(Events.PageActionClicked, (e) => {
  const allSvgs = [].slice.call(document.querySelectorAll('svg'));

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

function flattenData(candidate) {
  const count = candidate.data[candidate.schema[0]].length;

  // convert to vddf schema
  const data = [];

  let candidateSchema = candidate.schema.filter(c => {
    const sample = candidate.data[c][0];

    return sample !== null && sample !== undefined && typeof sample !== 'object';
  });
  let schema = candidateSchema.map((c,i) => {
    let name = (c || `c${i+1}`).toLowerCase().replace(/[^a-z0-9]/gi, '_');

    if (/\d/.test(name[0])) {
      name = `c${name}`;
    }

    return { name };
  });

  for (let i = 0; i < count; i++) {
    const row = [];

    candidateSchema.forEach(name => {
      row.push(candidate.data[name][i] || null);
    });

    data.push(row);
  }

  return {
    data,
    schema
  };
}

function submitCharts(charts) {
  const manager = new Manager({baseUrl: store.serverUrl});

  const promises = charts.map(source => {
    let schema, data;

    return extractSource(source)
      .then(detect => {
        const flatten = flattenData(detect.candidate);
        schema = flatten.schema;
        data = flatten.data;

        return manager.load({
          title: source.title,
          schema,
          data,
          source: window.location + ''
        });
      })
      .then(vddf => {
        schema = vddf.schema;
        return manager.export(vddf);
      }).then(result => {
      // also submit svg to server
      manager.client.request('POST', `api/vddf/${result.uuid}/svg`, {
        svg: source.svg
      });

      result.title = source.title;
      result.name = (source.title ? source.title + '' : 'untitiled').toLowerCase()
        .replace(/[^a-z0-9]/gi, '_') // special chars
        .replace(/_+/g, '_'); // this will make the name easier to read

      result.data = data;
      result.schema = schema;

      result.preview = `${store.serverUrl}/charts/${result.uuid}.svg`;
      // result.preview = source.svgDataUrl;

      Events.dispatch(Events.SaveChart, null, {data: result});
    }).catch(err => {
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
