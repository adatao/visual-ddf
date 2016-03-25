import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';

const style = {
  tableIcon: {
    fontSize: '80px',
    lineHeight: '120px',
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
            <img width='95%' style={{marginTop: '4px'}} src={this.props.preview || chart.preview} />
          </div>
        </div>
      );
    }

    return (
      <div className='preview'>
        <FontIcon style={style.tableIcon} className='mdi mdi-table' />
      </div>
    );
  }

  render() {
    const chart = this.props.chart;

    return (
      <div onClick={this.props.onClick} className='vddf-chart-preview'>
        {this.getPreview()}
        <div className='title'>
          {chart.name || chart.title}
        </div>
      </div>
    );
  }
}
