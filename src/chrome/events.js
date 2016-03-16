const Events = {
  DetectionReady: 'detection-ready',
  PageActionClicked: 'page-action-clicked',

  dispatch(event, target, data) {
    const done = new CustomEvent(event, {detail: data});
    (target || document).dispatchEvent(done);
  }
};

export default Events;
