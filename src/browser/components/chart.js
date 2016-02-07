import React from 'react';
import AdaVizChart from './adaviz';
import DropdownMenu from './dropdown-menu';
import Popover from './popover';
import ChangeChartDropdown from './change-chart-dropdown';
import DataEditModal from './data-edit-modal';
import ExportModal from './export-modal';
import MenuItem from 'material-ui/lib/menus/menu-item';
import autobind from 'autobind-decorator';
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

  @autobind
  handleUpdate() {
    this.renderChart();
  }

  renderChart() {
    const vddf = this.props.vddf;
    const raw = vddf.fetch();

    // convert to adaviz structure
    let data = raw.map(d => {
      return this.props.vddf.getSchema().reduce((obj,column,idx) => {
        return Object.assign(obj, {[column.name]: d[idx] });
      }, {});
    });

    this.setState({
      adaviz: Immutable.fromJS({
        input: Object.assign(vddf.visualization, {
          width: this.props.width,
          height: this.props.height
        }),
        data
      })
    });
  }

  @autobind
  changeChartType(type) {
    let vddf = this.props.vddf;
    vddf.changeChartType(type);
  }

  @autobind
  toggleEditModal() {
    this.setState({
      showEditModal: !this.state.showEditModal
    });
  }

  @autobind
  toggleExportModal() {
    this.setState({
      showExportModal: !this.state.showExportModal
    });
  }

  @autobind
  saveData(data) {
    this.vddf.update(data);
    this.toggleEditModal();
  }

  @autobind
  exportChart() {
    this.vddf.manager.export(this.vddf)
      .then(result => {
        this.setState({
          embedResult: result
        });

        this.toggleExportModal();
      });
  }

  getToolbar() {
    return (
      <div style={{float: 'right'}}>
        {this.getChartTypePopover()}
        {this.getMenu()}
      </div>
    );
  }

  getMenu() {
    let menus = null;

    menus = (
      <DropdownMenu>
        <MenuItem primaryText='Rename ...'/>
        <MenuItem onClick={this.toggleEditModal} primaryText='Edit data ...'/>
        <MenuItem primaryText='Download data'/>
        <MenuItem onClick={this.exportChart} primaryText='Export ...'/>
      </DropdownMenu>
    );

    return menus;
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
      <AdaVizChart spec={this.state.adaviz} />
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

  @autobind
  revertChange() {
    this.vddf.revert();
  }

  render() {
    let title = this.vddf.title || 'Untititled Chart';

    return (
      <div style={Object.assign(style.container, {width: this.props.width})}>
        <div className='viz-title' style={style.title}>
          {title}
          {this.getToolbar()}
        </div>
        {this.getNotificationNotice()}
        {this.state.adaviz && this.getChart()}
        {this.state.showEditModal && this.getEditModal()}
        {this.state.showExportModal && this.getExportModal()}
      </div>
    );
  }
}
