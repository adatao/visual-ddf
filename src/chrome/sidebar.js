import $ from 'jQuery';
// import { createDragHandle } from './dragHandler';
import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/sidebar';
import Events from './events';
import { loadMaterialFonts } from 'src/browser/utils';
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

    const source = getSource(e);
    const svgSource = source.source[0];

    return {
      title: source.title,
      node: e,
      svg: svgSource,
      svgDataUrl: 'data:image/svg+xml;base64,' + btoa(svgSource)
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

    console.log('Submitting', candidate, {schema, data});

    return manager.load({
      title: c.title,
      schema,
      data,
      source: window.location + ''
    }).then(vddf => {
      schema = vddf.schema;
      return manager.export(vddf);
    }).then(result => {
      // also submit svg to server
      manager.client.request('POST', `api/vddf/${result.uuid}/svg`, {
        svg: c.svg
      });

      result.title = c.title;
      result.name = (c.title ? c.title + '' : 'untitiled').toLowerCase()
        .replace(/[^a-z0-9]/gi, '_') // special chars
        .replace(/_+/g, '_'); // this will make the name easier to read

      result.data = data;
      result.schema = schema;

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

function detectCharts() {
  let found = 0;
  const docs = [document];

  $('iframe').each(() => {
    try {
      docs.push(this.contentDocument);
    } catch (ex) {
      // safe to ignore
      console.log(ex);
    }
  });

  $('svg').each(function() {
    const el = this;
    const $el = $(this);
    let isD3 = false;

    $el.find('*').each(function (i, child) {
      if (child.__data__) {
        isD3 = true;
        return false;
      }
    });

    if (isD3) {
      el.__d3__ = true;

      // const handle = createDragHandle(el);
      // $el.data('vddf-handler', handle.attr('id'));
      // $('body').append(handle);
      found++;
    }
  });

  console.log(`Detect ${found} available charts`);

  // trigger the done event
  if (found) {
    Events.dispatch(Events.DetectionReady);
  }
}

// it may took a while for the chart to  be draw, so delay a bit before start rendering
setTimeout(() => {
  detectCharts();
}, 2000); // TODO: change to 2s later
