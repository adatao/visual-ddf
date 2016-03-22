import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';

const style = {
  tableIcon: {
    fontSize: '128px',
    lineHeight: '180px',
    verticalAlign: 'middle',
    opacity: 0.5
  }
};

export default class Item extends React.Component {
  static contextTypes = {
    manager: React.PropTypes.object
  };

  shouldComponentUpdate(nextProps) {
    const oldChart = this.props.chart;
    const newChart = nextProps.chart;

    return oldChart.uuid !== newChart.uuid || this.props.preview !== nextProps.preview;
  }

  getPreview() {
    const chart = this.props.chart;

    if (this.props.preview || chart.preview) {
      return (
        <div className='preview'>
          <div className='img'>
            <img width='100%' src={this.props.preview || chart.preview} />
          </div>
        </div>
      );
    }

    return (
      <div className='preview'>
        <FontIcon style={style.tableIcon} className='mdi mdi-database' />
      </div>
    );
  }

  render() {
    return (
      <div onClick={this.props.onClick} className='vddf-chart-preview'>
        {this.getPreview()}
        <div className='title'>
          {this.props.name}
        </div>
      </div>
    );
  }
}
