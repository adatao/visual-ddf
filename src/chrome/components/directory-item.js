import React from 'react';

export default class Item extends React.Component {
  static contextTypes = {
    manager: React.PropTypes.object
  };

  render() {
    const chart = this.props.chart;
    const previewImage = `${this.context.manager.config.baseUrl}/charts/${chart.uuid}.svg`;

    return (
      <div onClick={this.props.onClick} className='vddf-chart-preview'>
        <div className='preview'>
          <div className='img'>
            <img width='100%' src={previewImage} />
          </div>
        </div>
        <div className='title'>
          {this.props.name}
        </div>
      </div>
    );
  }
}
