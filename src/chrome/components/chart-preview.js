import React from 'react';

// TODO: rename to sidebar-item
export default class ChartPreview extends React.Component {

  static contextTypes = {
    baseUrl: React.PropTypes.string
  };

  render() {
    const isChecked = this.props.checked;
    const baseUrl = this.context.baseUrl;
    const chart = this.props.chart;
    const imgUrl = chart.previewUrl;

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
        <div className='img'>
          <img width='100%' src={imgUrl} />
        </div>
      </div>
    );
  }
}
