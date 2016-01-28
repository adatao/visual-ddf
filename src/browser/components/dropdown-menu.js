import React from 'react';
import Menu from 'material-ui/lib/menus/menu';
import FontIcon from 'material-ui/lib/font-icon';
import autobind from 'autobind-decorator';

const style = {
  root: {
    position: 'relative',
    display: 'inline-block'
  },
  menuRoot: {
    position: 'absolute',
    marginTop: '100%',
    top: 0,
    right: 0,
    zIndex: 10
  },
  menuIcon: {
    color: '#cecece',
    fontSize: 18,
    cursor: 'pointer',
    marginRight: '4px'
  },
  menuList: {
    paddingTop: '4px',
    paddingBottom: '4px'
  }
};

export default class DropdownMenu extends React.Component {
  static propTypes = {
    icon: React.PropTypes.string,
    iconStyle: React.PropTypes.object
  };

  static defaultProps = {
    icon: 'keyboard_arrow_down'
  };

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  @autobind
  toggleMenu() {
    this.setState({
      open: !this.state.open
    });
  }

  getMenu() {
    return (
      <div style={style.menuRoot}>
      <Menu desktop autowidth={false} listStyle={style.menuList}>
        {this.props.children}
      </Menu>
      </div>
    );
  }

  render() {
    return (
      <div style={style.root}>
        <FontIcon onClick={this.toggleMenu} style={style.menuIcon} className='material-icons'>{this.props.icon}</FontIcon>
        {this.state.open && this.getMenu()}
      </div>
    );
  }
}
