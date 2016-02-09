import React from 'react';
import AdaVizChart from './adaviz';
import DropdownMenu from './dropdown-menu';
import Popover from './popover';
import ChangeChartDropdown from './change-chart-dropdown';
import DataEditModal from './data-edit-modal';
import ExportModal from './export-modal';
import ChartSettings from './chart-settings';
import MenuItem from 'material-ui/lib/menus/menu-item';
import FontIcon from 'material-ui/lib/font-icon';
import Immutable from 'immutable';

const style = {
  container: {
    margin: '0 auto',
    boxShadow: '0 0 4px 2px rgba(0,0,0,0.1)',
    borderRadius: '2px'
  },
  title: {
    background: '#f2f2f2',
    color: '#448afd',
    padding: '6px 10px',
    position: 'relative'
  },
  menuIcon: {
    color: '#cecece',
    fontSize: 18,
    cursor: 'pointer',
    marginRight: '4px'
  },
  menuItem: {
    paddingLeft: '16px',
    paddingRight: '16px'
  },
  modificationNotice: {
    background: '#FCFCE0',
    fontSize: '0.85em',
    padding: '4px 8px'
  },
  noticeLink: {
    color: 'rgb(29, 170, 241)',
    cursor: 'pointer'
  }
};

export default class Chart extends React.Component {
  static defaultProps = {
    width: 750,
    height: 500
  };

  static childContextTypes = {
    baseUrl: React.PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      adaviz: null,
      showEditModal: false,
      showExportModal: false,
      showChartSettings: false,
      embedResult: null
    };
  }

  getChildContext() {
    return {
      baseUrl: `${this.props.baseUrl}/`
    };
  }

  get vddf() {
    return this.props.vddf;
  }

  componentDidMount() {
    this.renderChart();
    this.vddf.on('update', this.handleUpdate);
  }

  componentWillUnmount() {
    this.vddf.off('update', this.handleUpdate);
  }

  handleUpdate = () => {
    this.renderChart();
  };

  renderChart() {
    const vddf = this.props.vddf;
    const viz = vddf.visualization;
    const raw = vddf.fetch();

    // convert to adaviz structure
    let data = raw.map(d => {
      return this.props.vddf.schema.reduce((obj,column,idx) => {
        return Object.assign(obj, {[column.name]: d[idx] });
      }, {});
    });

    if (viz.aggregation) {
      // XXX: should refer to category parameter instead
      let groupBy = {};
      let keys = [viz.y];
      let measurement = viz.x;

      if (viz.color) {
        keys.push(viz.color);
      }

      data.forEach(d => {
        const key = keys.reduce((obj, cur) => ({ ...obj, [cur]: d[cur]}), {});
        const hash = Object.values(key).join(',');

        if (!groupBy[hash]) {
          groupBy[hash] = {
            key: key,
            values: []
          };
        }

        groupBy[hash].values.push(d);
      });

      let aggregated = Object.values(groupBy).map(g => {
        let value;

        switch (viz.aggregation) {
        case 'min':
          value = g.values.map(c => c[measurement]).reduce((prev, cur) => Math.min(prev, cur));
          break;
        case 'max':
          value = g.values.map(c => c[measurement]).reduce((prev, cur) => Math.max(prev, cur));
          break;
        case 'sum':
          value = g.values.reduce((prev, cur) => prev + cur[measurement], 0);
          break;
        case 'avg':
          value = g.values.reduce((prev, cur) => prev + cur[measurement], 0) / g.values.length;
          break;
        }

        return {
          ...g.key,
          [measurement]: value
        };
      });

      data = aggregated;
    }

    this.setState({
      adaviz: Immutable.fromJS({
        input: Object.assign(viz, {
          width: this.props.width,
          height: this.props.height
        }),
        data
      })
    });
  }

  changeChartType = (type) => {
    let vddf = this.props.vddf;
    vddf.changeChartType(type);
  };

  toggleEditModal = () => {
    this.setState({
      showEditModal: !this.state.showEditModal
    });
  };

  toggleExportModal = () => {
    this.setState({
      showExportModal: !this.state.showExportModal
    });
  };

  toggleChartSettings = () => {
    this.setState({
      showChartSettings: !this.state.showChartSettings
    });
  };

  saveData = (data, schema) => {
    this.vddf.updateData(data, schema);
    this.toggleEditModal();
  };

  exportChart = () => {
    this.vddf.manager.export(this.vddf)
      .then(result => {
        this.setState({
          embedResult: result
        });

        this.toggleExportModal();
      });
  };

  downloadChart = () => {
    this.vddf.manager.getDownloadLink(this.vddf)
      .then(downloadLink => {
        let link = document.createElement('a');
        link.download = `${this.vddf.title}.csv`;
        link.href = downloadLink;
        link.click();
      });
  };

  getToolbar() {
    return (
      <div style={{float: 'right'}}>
        {this.getChartTypePopover()}
        <FontIcon style={style.menuIcon} onClick={this.toggleChartSettings} className='material-icons'>settings</FontIcon>
        <DropdownMenu>
          <MenuItem onClick={this.toggleEditModal} primaryText='Edit data ...'/>
          {this.vddf.isModified() && <MenuItem onClick={this.exportChart} primaryText='Export ...'/>}
          <MenuItem onClick={this.downloadChart} primaryText='Download as CSV'/>
        </DropdownMenu>
      </div>
    );
  }

  getChartTypePopover() {
    return (
      <ChangeChartDropdown charts={this.vddf.getAvailableCharts()} onClick={this.changeChartType}/>
    );
  }

  getEditModal() {
    return <DataEditModal vddf={this.vddf} onRequestClose={this.toggleEditModal} onSave={this.saveData} />;
  }

  getExportModal() {
    return <ExportModal embedCode={this.state.embedResult.embedCode} onRequestClose={this.toggleExportModal} />;
  }

  getChart() {
    return (
      <div style={{position: 'relative'}}>
        <AdaVizChart spec={this.state.adaviz} />
      </div>
    );
  }

  getChartSettings() {
    return (
      <ChartSettings vddf={this.vddf} />
    );
  }

  getNotificationNotice() {
    if (this.vddf.isModified()) {
      return (
        <div style={style.modificationNotice}>
          You have customized this visualization. <span style={style.noticeLink} onClick={this.revertChange}>Revert</span> or <span onClick={this.exportChart} style={style.noticeLink}>Export</span>.
        </div>
      );
    }
  }

  revertChange = () => {
    this.vddf.revert();
  };

  render() {
    let title = this.vddf.title || 'Untititled Chart';

    return (
      <div style={Object.assign(style.container, {width: this.props.width})}>
        <div className='viz-title' style={style.title}>
          {title}
          {this.getToolbar()}
        </div>
        {this.state.showChartSettings && this.getChartSettings()}
        {this.state.adaviz && this.getChart()}
        {this.getNotificationNotice()}
        {this.state.showEditModal && this.getEditModal()}
        {this.state.showExportModal && this.getExportModal()}
      </div>
    );
  }
}
