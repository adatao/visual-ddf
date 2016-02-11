import React from 'react';
import AdaVizChart from './adaviz';
import DropdownMenu from './dropdown-menu';
import DataEditModal from './data-edit-modal';
import ExportModal from './export-modal';
import EditTitleModal from './edit-title-modal';
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
      modal: {},
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

    // convert to adaviz data structure
    let data = raw.map(d => {
      return this.props.vddf.schema.reduce((obj,column,idx) => {
        return Object.assign(obj, {[column.name]: d[idx] });
      }, {});
    });


    // TODO: move this out of this component
    // TODO: cache this computation
    if (viz.aggregation && viz.type !== 'datatable') {
      let groupBy = {};
      let keys = [viz.x];
      let measurement = viz.y;

      // parameters passed by adaviz is messed up, there is no way
      // we can identify which part is category and measurement
      if (viz.orientation === 'horizontal') {
        keys = [viz.y];
        measurement = viz.x;
      }

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
        let series = g.values.map(c => parseFloat(c[measurement]));

        switch (viz.aggregation) {
        case 'min':
          value = series.reduce((prev, cur) => Math.min(prev, cur));
          break;
        case 'max':
          value = series.reduce((prev, cur) => Math.max(prev, cur));
          break;
        case 'sum':
          value = series.reduce((prev, cur) => prev + cur, 0);
          break;
        case 'avg':
          value = series.reduce((prev, cur) => prev + cur, 0) / g.values.length;
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

  getModal(name) {
    switch (name) {
    case 'data':
      return <DataEditModal vddf={this.vddf} onRequestClose={() => this.toggleModal('data')} onSave={this.saveData} />;
    case 'title':
      return <EditTitleModal title={this.vddf.title} onSave={this.saveTitle} onRequestClose={() => this.toggleModal('title')} />;
    case 'export':
      return <ExportModal embedCode={this.state.embedResult.embedCode} onRequestClose={() => this.toggleModal('export')} />;
    }
  }

  toggleModal = (name) => {
    let modal = this.state.modal;

    if (modal[name]) {
      delete modal[name];
    } else {
      modal[name] = this.getModal(name);
    }

    this.setState({modal: modal});
  };

  getActiveModals = () => {
    for (let name in this.state.modal) {
      return this.state.modal[name];
    }
  };

  toggleChartSettings = () => {
    this.setState({
      showChartSettings: !this.state.showChartSettings
    });
  };

  saveData = (data, schema) => {
    this.vddf.updateData(data, schema);
    this.toggleModal('data');
  };

  saveTitle = (title) => {
    this.vddf.title = title;
    this.toggleModal('title');
  };

  exportChart = () => {
    this.vddf.manager.export(this.vddf)
      .then(result => {
        this.setState({
          embedResult: result
        });

        this.toggleModal('export');
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
        <FontIcon style={style.menuIcon} onClick={this.toggleChartSettings} className='material-icons'>equalizer</FontIcon>
        <DropdownMenu>
          <MenuItem onClick={() => this.toggleModal('title')} primaryText='Edit title ...'/>
          <MenuItem onClick={() => this.toggleModal('data')} primaryText='Edit data ...'/>
          {this.vddf.isModified() && <MenuItem onClick={this.exportChart} primaryText='Export ...'/>}
          <MenuItem onClick={this.downloadChart} primaryText='Download as CSV'/>
        </DropdownMenu>
      </div>
    );
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
        {this.getActiveModals()}
      </div>
    );
  }
}
