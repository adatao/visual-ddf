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

    // TODO: scroll it here
    const container = this.refs.detailContainer;

    setTimeout(() => {
      const scroll = container.offsetTop - Math.max(window.innerHeight - this.calculateHeight() + 32, 0) + 100;

      window.scrollTo(0, scroll);
    }, 350);
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

  calculateHeight() {
    return Math.max(this.props.screenHeight ? this.props.screenHeight * 0.8 : 400, 400);
  }

  render() {
    const chart = this.props.chart;
    const width = 1216;
    const height = this.calculateHeight();
    const offset = Math.max(0, (this.props.screenWidth - 1240) / 2);
    const arrowMargin = offset + 132 + 316 * this.props.arrowOffset ;
    const detailStyle = {left: -offset, width: Math.max(this.props.screenWidth, width)};

    return (
      <div ref='detailContainer' style={detailStyle} className='detail-view-container'>
        <div className='detail-arrow' style={{marginLeft: arrowMargin}}></div>
        <ReactCSSTransitionGroup transitionName='slidedown'
                                 transitionAppear={true}
                                 transitionAppearTimeout={300}
                                 transitionEnterTimeout={300}
                                 transitionLeaveTimeout={300}
                                 >
          <div style={{height: height+32}} data-key={chart.uuid} className='detail-view'>
            {this.renderVDDF({width, height})}
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
