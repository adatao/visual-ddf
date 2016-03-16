import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class ItemDetail extends React.Component {

  static contextTypes = {
    manager: React.PropTypes.object
  };

  componentDidMount() {
    this.renderVDDF();
  }

  componentDidUpdate() {
    this.renderVDDF();
  }

  renderVDDF() {
    const manager = this.context.manager;
    const chart = this.props.chart;

    this.context.manager.load(manager.config.baseUrl + '/vddf/' + chart.uuid)
      .then(vddf => {
        manager.render(vddf, this.refs.chart);
      });
  }

  render() {
    const arrowMargin = 140 + 316 * this.props.arrowOffset;
    const chart = this.props.chart;

    return (
      <div className='detail-view-container'>
        <div className='detail-arrow' style={{marginLeft: arrowMargin}}></div>
        <ReactCSSTransitionGroup transitionName='slidedown'
                                 transitionAppear={true}
                                 transitionAppearTimeout={300}
                                 transitionEnterTimeout={300}
                                 transitionLeaveTimeout={300}
                                 >
          <div data-key={chart.uuid} className='detail-view'>
            <div ref='chart' data-width='800' data-height='500' style={{width: 800, margin: '0 auto'}}>
            </div>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

