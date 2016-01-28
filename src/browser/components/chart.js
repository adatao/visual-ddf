import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';
import DropdownMenu from './dropdown-menu';
import Popover from './popover';
import AdaVizChart from './adaviz';
import MenuItem from 'material-ui/lib/menus/menu-item';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
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
    width: 600,
    height: 400
  };

  constructor(props) {
    super(props);

    this.state = {
      adaviz: null
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

    this.props.vddf.fetch()
      .then(raw => {
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
      });
  }

  changeChartType(type) {
    let vddf = this.props.vddf;
    vddf.changeChartType(type);
    this.renderChart();
  }

  getMenu() {
    let menus = null;

    menus = (
        <DropdownMenu>
        <MenuItem primaryText='Rename ...'/>
        <MenuItem primaryText='Edit data ...'/>
        <MenuItem primaryText='Publish ...'/>
        </DropdownMenu>
    );

    return menus;
  }

  getChartTypePopover() {
    const items = this.vddf.getAvailableCharts().map(type => {
      return <ListItem onClick={this.changeChartType.bind(this, type)} key={type} primaryText={type}  innerDivStyle={{padding: '8px 16px', fontSize: 15}}/>;
    });

    return (
      <Popover icon='assessment'>
        <List>
        {items}
        </List>
      </Popover>
    );
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
        <FontIcon style={style.menuIcon} className='material-icons'>filter_list</FontIcon>
        {this.getMenu()}
        </div>
        </div>
        {this.state.adaviz && this.getChart()}
      </div>
    );
  }
}
