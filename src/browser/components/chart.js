import React from 'react';
import AdaViz from 'adaviz';
import FontIcon from 'material-ui/lib/font-icon';
import Menu from 'material-ui/lib/menus/menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import autobind from 'autobind-decorator';

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
    cursor: 'pointer'
  },
  menu: {
    position: 'absolute',
    marginTop: '100%'
  },
  menuList: {
    paddingTop: '4px',
    paddingBottom: '4px'
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
      menuOpenned: false
    };
  }

  componentDidMount() {
    const vddf = this.props.vddf;

    this.props.vddf.fetch()
      .then(raw => {
        // convert to adaviz structure
        let data = raw.map(d => {
          return this.props.vddf.getSchema().reduce((obj,column,idx) => {
            return Object.assign(obj, {[column.name]: d[idx] });
          }, {});
        });

        AdaViz.render(this.refs.chart, Object.assign(vddf.visualization, {
          width: this.props.width,
          height: this.props.height,
          data
        }));
      });
  }

  @autobind
  toggleMenu() {
    this.setState({
      menuOpenned: !this.state.menuOpenned
    });
  }

  getMenu() {
    let menus = null;

    if (this.state.menuOpenned) {
      menus = (
          <Menu desktop style={style.menu} listStyle={style.menuList}>
          <MenuItem innerDivStyle={style.menuItem} primaryText='Edit data ...'/>
          <MenuItem innerDivStyle={style.menuItem} primaryText='Publish ...'/>
          </Menu>
      );
    }

    return (
        <div style={{position: 'relative', display: 'inline-block', float: 'right'}}>
        <FontIcon onClick={this.toggleMenu} style={style.menuIcon} className='material-icons'>keyboard_arrow_down</FontIcon>
        <div>
        {menus}
        </div>
        </div>
    );
  }

  render() {
    return (
      <div style={Object.assign(style.container, {width: this.props.width})}>
        <div className='viz-title' style={style.title}>
        This is chart title
      {this.getMenu()}
        </div>
        <div className='viz-container'>
          <div ref='chart'></div>
        </div>
      </div>
    );
  }
}
