import React from 'react';
import AdaViz from 'adaviz';
import Immutable from 'immutable';

export default class AdaVizChart extends React.Component {
  static propTypes = {
    spec: React.PropTypes.object.isRequired
  };

  shouldComponentUpdate(nextProps) {
    // console.log(nextProps.spec.toJS());
    return nextProps.spec !== this.props.spec;
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

    // AdaViz does not clean up data table properly
    // so we need to do this trick
    this.refs.chart.innerHTML = '';
    AdaViz.render(this.refs.chart, spec);
  }

  render() {
    return (<div className='viz-container'><div ref='chart'></div></div>);
  }
}
