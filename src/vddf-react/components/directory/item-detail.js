import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import _ from 'lodash';
import { getSource as getSvgSource } from '../../../browser/lib/svg-crowbar2-es6';

export default class ItemDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // const container = this.refs.detailContainer;

    // setTimeout(() => {
    //   const scroll = container.offsetTop - Math.max(window.innerHeight - this.calculateHeight() + 32, 0) + 100;

    //   window.scrollTo(0, scroll);
    // }, 350);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.chart.uuid !== nextProps.chart.uuid;
  }

  renderVDDF(props) {
    const vddf = this.props.vddf;

    props.key = vddf.uuid;
    props.active = true;

    // XXX: don't refer to manager here directly ...
    return vddf.manager.config.renderer.getComponent(
      vddf, props
    );
  }

  renderPreview() {
    const vddf = this.props.vddf;
    const props = {
      width: 600,
      height: 360
    };

    props.onRendered = this.onChartRendererd;
    props.key = `preview-${vddf.uuid}`;
    props.mode = 'chartonly';

    // XXX: don't refer to manager here directly ...
    return vddf.manager.config.renderer.getComponent(
      vddf, props
    );
  }

  onChartRendererd = _.debounce((el) => {
    const vddf = this.props.vddf;

    if (vddf.chartType !== 'datatable') {
      const svg = el.querySelector('.adaviz-chart svg');
      const preview = this.props.updatePreview;

      svg.setAttribute('version', '1.1');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      const svgSource = getSvgSource(svg);
      const svgRaw = 'data:image/svg+xml;base64,' + btoa(svgSource.source[0]);

      preview && preview(this.props.chart, svgRaw);
    }
  }, 300);

  calculateHeight() {
    return Math.max(this.props.screenHeight ? this.props.screenHeight * 0.8 : 400, 400);
  }

  render() {
    const chart = this.props.chart;
    const width = 1216;
    const height = this.calculateHeight();
    const offset = Math.max(0, (this.props.screenWidth - 1240) / 2);
    const arrowMargin = offset + 85 + 202 * this.props.arrowOffset ;
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
            <div style={{position: 'absolute', left: '-10000px', top: '-100000px'}}>
              {this.renderPreview()}
            </div>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
