import React from 'react';
import ReactDOM from 'react-dom';
import Menu from 'material-ui/lib/menus/menu';
import FontIcon from 'material-ui/lib/font-icon';
import Popover from './popover';

const style = {
  root: {
    position: 'relative',
    display: 'inline-block'
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
    iconStyle: React.PropTypes.object,
    onRequestClose: React.PropTypes.func
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

  render() {
    return (
      <Popover icon='keyboard_arrow_down' onRequestClose={this.props.onRequestClose}>
        <Menu desktop autowidth={false} listStyle={style.menuList}>
          {this.props.children}
        </Menu>
      </Popover>
    );
  }
}
