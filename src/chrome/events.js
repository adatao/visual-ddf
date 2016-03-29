const Events = {
  DetectionReady: 'detection-ready',
  PageActionClicked: 'page-action-clicked',
  MenuActionClicked: 'menu-action-clicked',
  SaveChart: 'save-chart',
  SaveChartDone: 'save-chart-done',
  SubmissionDone: 'submission-done',
  SqlRequest: 'sql-request',
  SqlResponse: 'sql-response',

  dispatch(event, target, data) {
    const done = new CustomEvent(event, {detail: data});
    (target || document).dispatchEvent(done);
  }
};

export default Events;
