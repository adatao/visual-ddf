import React from 'react';
import AdaVizChart from './adaviz';
import DropdownMenu from './dropdown-menu';
import Popover from './popover';
import ChangeChartDropdown from './change-chart-dropdown';
import DataEditModal from './data-edit-modal';
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
    fontFamily: '\'Open Sans\', \'Helvetica Neue\', Helvetica, Arial, sans-serif',
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
  }
};

export default class Chart extends React.Component {
  static defaultProps = {
    width: 750,
    height: 500
  };

  constructor(props) {
    super(props);

    this.state = {
      adaviz: null,
      showEditModal: false
    };
  }

  get vddf() {
    return this.props.vddf;
  }

  componentDidMount() {
    // TODO: listen to vddf update event
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
          ...vddf.visualization,
        width: this.props.width,
        height: this.props.height,
        data
      })
    });
  }

  @autobind
  changeChartType(type) {
    let vddf = this.props.vddf;
    vddf.changeChartType(type);
    this.renderChart();
  }

  @autobind
  toggleEditModal() {
    this.setState({
      showEditModal: !this.state.showEditModal
    });
  }

  @autobind
  saveData(data) {
    this.vddf.update(data);
    this.toggleEditModal();
    this.renderChart();
  }

  getMenu() {
    let menus = null;

    menus = (
        <DropdownMenu>
        <MenuItem primaryText='Rename ...'/>
        <MenuItem onClick={this.toggleEditModal} primaryText='Edit data ...'/>
        <MenuItem primaryText='Publish ...'/>
        </DropdownMenu>
    );

    return menus;
  }

  getChartTypePopover() {
    return (
        <ChangeChartDropdown charts={this.vddf.getAvailableCharts()} onClick={this.changeChartType} />
    );
  }

  getEditModal() {
    return <DataEditModal vddf={this.vddf} onRequestClose={this.toggleEditModal} onSave={this.saveData} />;
  }

  getChart() {
    return (
      <AdaVizChart spec={this.state.adaviz} />
    );
  }

  render() {
    let title = this.vddf.title || 'Untititled Chart';

    return (
      <div style={Object.assign(style.container, {width: this.props.width})}>
        <div className='viz-title' style={style.title}>
        {title}
        <div style={{float: 'right'}}>
        {this.getChartTypePopover()}
        {this.getMenu()}
        </div>
        </div>
        {this.state.adaviz && this.getChart()}
        {this.state.showEditModal && this.getEditModal()}
      </div>
    );
  }
}
