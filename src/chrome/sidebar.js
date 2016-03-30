// import { createDragHandle } from './dragHandler';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/sidebar';
import Events from './events';
import { loadMaterialFonts } from 'src/browser/utils';
import UUID from 'uuid';
import { detectSources, extractSource, previewSource } from './extractor';
import '../vddf-react/common.css';
import './sidebar.css';

let store = {
  sources: [],
  selectedElement: null
};

let selectedItem;

loadMaterialFonts();

function submit(payload) {
  let done, listener;

  listener = (e) => {
    if (e.detail.sourceId === payload.sourceId) {
      payload = Object.assign(payload, {
        embedResult: e.detail.embedResult
      });

      done(payload);
      document.removeEventListener(Events.SaveChartDone, listener);
      listener = null;
    }
  };

  return new Promise((resolve, reject) => {
    done = resolve; // no reject yet ...
    document.addEventListener(Events.SaveChartDone, listener);

    // forward to content page, and wait for the done event
    Events.dispatch(Events.SaveChart, null, {data: payload});
  });
}

function sql(payload) {
  let done, listener;

  if (typeof payload === 'string') {
    payload = { query: payload };
  }

  if (!payload.uuid) {
    payload.uuid = UUID.v4();
  }

  listener = (e) => {
    if (e.detail.uuid === payload.uuid) {
      done(e.detail);
      document.removeEventListener(Events.SqlResponse, listener);
      listener = null;
    }
  };

  return new Promise((resolve, reject) => {
    done = resolve; // no reject yet ...
    document.addEventListener(Events.SqlResponse, listener);

    // forward to content page, and wait for the done event
    Events.dispatch(Events.SqlRequest, null, {data: payload});
  });
}

window.__sql = sql;

document.addEventListener("mousemove", (e) => {
  selectedItem = e.target;
});

document.addEventListener(Events.PageActionClicked, (e) => {
  const isSidebarVisible = !!document.querySelector('#vddf-sidebar .vddf-sidebar');

  // toggle the sidebar on click
  if (isSidebarVisible) {
    closeSidebar();
  } else {
    store.baseUrl = e.detail.baseUrl;
    store.serverUrl = e.detail.serverUrl;

    // now preview source
    store.charts = store.sources
      .map(previewSource);

    renderSidebar();
  }

});

document.addEventListener('share-to-extension', (e) => {
  const vddf = e.detail.vddf;

  // submit then go to workspace
  submit({
    sourceId: UUID.v4(),
    schema: vddf.schema,
    data: vddf.fetch(),
    title: vddf.title,
    visualization: vddf.visualization
  }).then(() => {
    Events.dispatch(Events.SubmissionDone);
  });
});

document.addEventListener(Events.MenuActionClicked, (e) => {
  let target = null, source, action = e.detail.action;

  // only support 1 source for now
  for (let i in store.sources) {
    const check = store.sources[i];
    if (!check.selector && !check.node) continue;

    // TODO: check if the context item is "near" the source
    // then conver that, for now we hardcode the selector
    source = check;
    target = source.node || document.querySelector(source.selector);
  }

  if (target) {
    const assetUrl = e.detail.assetUrl;
    const width = target.offsetWidth;
    const height = target.offsetHeight + 25; // 20 is for the demo ....

    let placeholder  = document.createElement('div');
    placeholder.style.position = 'absolute';
    placeholder.style.left = target.offsetLeft + 'px';
    placeholder.style.top = target.offsetTop + 'px';
    placeholder.style.width = width  + 'px';
    placeholder.style.height = height  + 'px';
    placeholder.style.zIndex = 10;
    placeholder.style.background = 'rgba(0,0,0,0.3)';

    placeholder.innerHTML = `<img class='loader' src="${assetUrl}/rolling-white.svg" style='position: absolute; left: 50%; top: 50%; margin-left: -24; margin-right: -24;' />`;

    target.parentElement.appendChild(placeholder);

    // get the preview
    source = Object.assign({}, previewSource(source));
    extractSource(source)
      .then(result => {
        source = Object.assign(source, result);
        source.sourceId = UUID.v4();

        if (action === 'view') {
          source.embed = true;
          source.save = false;
        }

        return submit(source);
      })
      .then(submitResult => {
        if (action === 'submit') {
          placeholder.remove();
          Events.dispatch(Events.SubmissionDone);
          return;
        }

        // jquery solves the problem of inline script
        // i will fix that later
        const embedCode = submitResult.embedResult.embedCode
                .replace('<div ', `<div data-height="${target.offsetHeight}" data-active="1" style='visibility: hidden'`);

        // const iframeHtml = `<iframe class='vddf-iframe' src="${submitResult.embedResult.link}?mode=fullscreen" scrollbar=no frameBorder=0 width="${width}" height="${height}" style='visibility: hidden'></iframe>`;

        // iframe won't work with current event system :(
        $(placeholder).append($(embedCode));

        setTimeout(() => {
          placeholder.style.background = '';
          $('> .loader', placeholder).remove();
          $('> div', placeholder).css('visibility', 'visible');
        }, 1500);
      });
  } else {
    console.log('Unable to detect source');
  }
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
          sourceId: UUID.v4(),
          title: source.title,
          name: source.name,
          preview: source.previewUrl,
          visualization: result.visualization,
          source: window.location + '',
          svg: source.svg,
          dataUrl: source.dataUrl,
          data,
          schema
        };

        return submit(payload);
      })
      .catch(err => {
        console.log('There was an error submit', {schema, data}, err.stack);
        throw err;
      });
  });

  return Promise.all(promises).then(() => {
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
