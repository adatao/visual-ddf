const Events = {
  DetectionReady: 'detection-ready',
  PageActionClicked: 'page-action-clicked',
  SaveChart: 'save-chart',
  SubmissionDone: 'submission-done',

  dispatch(event, target, data) {
    const done = new CustomEvent(event, {detail: data});
    (target || document).dispatchEvent(done);
  }
};

export default Events;
