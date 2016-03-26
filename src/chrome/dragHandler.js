import $ from 'jquery';
import uuid from 'uuid';
import chrome from 'chrome';
import { extractD3Data } from './extractor';

const dragIcon = 'data:image/png;base64,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';

$(document).on('mouseenter', 'svg', function() {
  const el = this;
  const $el = $(el);

  if ($el.data('vddf-handler') !== undefined) {
    const handle = $('#' + $el.data('vddf-handler'));
    const box = el.getBoundingClientRect();
    const scrollTop = window.scrollY;

    handle.css({
      left: (box.left + box.width-8),
      top: box.top + 8 + scrollTop
    });

    handle.show();
  }
}).on('mouseleave', 'svg', function(e) {
  const el = this;
  const $el = $(el);

  // if move to the drag handle then don't do anything
  if (e.toElement && (
      $(e.toElement).parents('.vddf-drag-handle').length ||
      $(e.toElement).is('.vddf-drag-handle')
    )) return;

  if ($el.data('vddf-handler') !== undefined) {
    const handle = $('#' + $el.data('vddf-handler'));
    handle.hide();
  }
});

export function createDragHandle(svg) {
  const handle = $('<span class="vddf-drag-handle"><img width=22 src="' + dragIcon + '"/></span>');

  handle.attr('id', 'drag-' + uuid.v4());


  handle.css({
    position: 'absolute',
    display: 'none',
    cursor: 'pointer'
  });

  handle.on('dblclick', function(e) {
    let result = extractD3Data(svg);
    console.log(result);
  });

  handle.on('dragstart', function(e) {
    const dataTransfer = e.originalEvent.dataTransfer;

    // clear all data so we can control what will be dropped
    dataTransfer.clearData();

    // TODO: on drag set the capture here
    dataTransfer.setData('text/plain', 'DUMMY');
  });

  return handle;
}
