import $ from 'jQuery';
import Events from './events';
import { createDragHandle } from './dragHandler';
import './sidebar';
import { getSource } from 'src/browser/lib/svg-crowbar2-es6';

function detectCharts() {
  let found = 0;

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
      // const handle = createDragHandle(el);
      // $el.data('vddf-handler', handle.attr('id'));
      // $('body').append(handle);
      found++;
    }
  });

  console.log(`Detect ${found} available charts`);

  // trigger the done event
  Events.dispatch(Events.DetectionReady);
}

// it may took a while for the chart to  be draw, so delay a bit before start rendering
setTimeout(() => {
  detectCharts();
}, 500); // TODO: change to 2s later

window.getSVGSource = getSource;
