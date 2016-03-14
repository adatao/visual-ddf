const Events = {
  DetectionReady: 'detection-ready',
  PageActionClicked: 'page-action-clicked',

  dispatch(event, target, data) {
    var done = new CustomEvent(event, data);
    (target || document).dispatchEvent(done);
  }
};

export default Events;
