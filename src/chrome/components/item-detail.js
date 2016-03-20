import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class ItemDetail extends React.Component {

  static contextTypes = {
    manager: React.PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      vddf: null
    };
  }

  componentDidMount() {
    this.loadVDDF();
  }

  componentDidUpdate() {
    this.loadVDDF();
  }

  loadVDDF() {
    const manager = this.context.manager;
    const chart = this.props.chart;

    if (!this.state.vddf || this.state.vddf.uuid !== chart.uuid) {
      this.context.manager.load(manager.config.baseUrl + '/vddf/' + chart.uuid)
        .then(vddf => {
          // manager.render(vddf, this.refs.chart);
          this.setState({vddf: vddf});
        });
    }
  }

  renderVDDF(props) {
    if (this.state.vddf) {
      props.onRendered = this.onChartRendererd;
      props.key = this.state.vddf.uuid;

      return this.context.manager.config.renderer.getComponent(
        this.state.vddf, props
      );
    }
  }

  onChartRendererd = (el) => {
    if (this.state.vddf.uuid === this.props.chart.uuid) {
      const preview = this.props.updatePreview;

      if (preview) {
        console.log('chart update!', this.props.chart.uuid, el, preview);
      }
    }
  };

  render() {
    const chart = this.props.chart;
    const width = 1216;
    const height = 500;
    const offset = (this.props.screenWidth - 1240) / 2;
    const arrowMargin = 140 + 316 * this.props.arrowOffset ;

    return (
      <div style={{left: -offset, width: this.props.screenWidth}} className='detail-view-container'>
        <div className='detail-arrow' style={{marginLeft: arrowMargin}}></div>
        <ReactCSSTransitionGroup transitionName='slidedown'
                                 transitionAppear={true}
                                 transitionAppearTimeout={300}
                                 transitionEnterTimeout={300}
                                 transitionLeaveTimeout={300}
                                 >
          <div data-key={chart.uuid} className='detail-view'>
            {this.renderVDDF({width, height})}
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

