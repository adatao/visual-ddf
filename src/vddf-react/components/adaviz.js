import React from 'react';
import AdaViz from 'adaviz';
import Immutable from 'immutable';

/**
 * AdaViz Chart component
 */
export default class AdaVizChart extends React.Component {
  static propTypes = {
    spec: React.PropTypes.object.isRequired
  };

  shouldComponentUpdate(nextProps) {
    return nextProps.spec !== this.props.spec
      || nextProps.spec.onRendered !== this.props.onRendered;
  }

  componentDidUpdate() {
    this.renderChart();
  }

  componentDidMount() {
    this.renderChart();
  }

  renderChart() {
    let spec = this.props.spec;

    if (Immutable.Iterable.isIterable(spec)) {
      spec = spec.toJS();
    } else {
      console.warning('Spec is not immutable, chart update may not work correctly.');
    }

    spec.theme = {
      background: {
        fill: 'white'
      }
    };

    // bar chart does not render color correctly
    if (spec.input.type === 'bar' && spec.input.color) {
      spec.input.type = 'bar.stacked';
    }

    // spec.input.theme = 'arimoSunlight';

    // AdaViz does not clean up data table properly
    // so we need to do this trick
    this.refs.chart.innerHTML = '';
    this.refs.chart.__adaviz__ = spec;
    try {
      AdaViz.render(this.refs.chart, spec, (view) => {
        if (this.props.onRendered) {
          this.props.onRendered(this.refs.chart);
        }
      });
    } catch (ex) {
      console.log('AdaViz render error: ', ex);
    }
  }

  render() {
    return (<div className='viz-container'><div ref='chart'></div></div>);
  }
}
