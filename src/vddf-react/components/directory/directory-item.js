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

import chart1 from '../../../chrome/assets/chart1.js';

export default class Item extends React.Component {
  static contextTypes = {
    manager: React.PropTypes.object,
    storage: React.PropTypes.object
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
            <img draggable='false' width='95%' style={{marginTop: '4px'}} src={this.props.preview || chart.preview} />
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

  onDrop = (e) => {
    const uuid = e.dataTransfer.getData('application/vddf-uuid');

    // XXX: magic
    if (uuid && uuid !== this.props.chart.uuid) {
      this.context.manager.load(chart1)
        .then(vddf => {
          return this.context.storage.create({
            title: vddf.title,
            data: vddf.fetch(),
            schema: vddf.schema,
            visualization: {
              ...vddf.visualization,
              seriesMagic: 1
            }
          });
        })
        .then(() => this.props.reload(true));
    }
  };

  onDrag = (e) => {
    const dataTransfer = e.dataTransfer;
    const chart = this.props.chart;

    dataTransfer.clearData();
    dataTransfer.setData('application/vddf-uuid', chart.uuid);
  };

  render() {
    const chart = this.props.chart;

    return (
      <div draggable onClick={this.props.onClick} className='vddf-chart-preview' onDrop={this.onDrop} onDragStart={this.onDrag}>
        {this.getPreview()}
        <div className='title'>
          {chart.name || chart.title}
        </div>
      </div>
    );
  }
}
