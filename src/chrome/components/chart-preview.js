import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';

export default class ChartPreview extends React.Component {

  static contextTypes = {
    baseUrl: React.PropTypes.string
  };

  render() {
    const isChecked = this.props.checked;
    const baseUrl = this.context.baseUrl;
    const chart = this.props.chart;
    const imgUrl = chart.svgDataUrl || 'http://localhost:5001/chromeapp/preview1.png';

    let overlay;

    if (isChecked) {
      overlay = (
        <div className='overlay'>
          <span className='check-icon'>
            <img src={baseUrl + '/check-circle.svg'} />
          </span>
        </div>
      );
    }

    return (
      <div onClick={this.props.onClick} className='vddf-chart-preview'>
        {overlay}
        <div>
          <img width='100%' src={imgUrl} />
        </div>
      </div>
    );
  }
}
