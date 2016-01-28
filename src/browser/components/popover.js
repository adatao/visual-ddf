import React from 'react';
import Paper from 'material-ui/lib/paper';
import Menu from 'material-ui/lib/menus/menu';
import FontIcon from 'material-ui/lib/font-icon';
import autobind from 'autobind-decorator';

const style = {
  root: {
    position: 'relative',
    display: 'inline-block'
  },
  toggleIcon: {
    color: '#cecece',
    fontSize: 18,
    cursor: 'pointer',
    marginRight: '4px'
  },
  popover: {
    position: 'absolute',
    marginTop: '100%',
    top: 0,
    right: 0,
    zIndex: 10
  },
  paper: {
    minWidth: 120
  }
};

export default class Popover extends React.Component {
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
  toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  getPopover() {
    return (
        <div style={style.popover}>
        <Paper>
          <div style={style.paper}>
           {this.props.children}
          </div>
        </Paper>
        </div>
    );
  }

  render() {
    return (
      <div style={style.root}>
        <FontIcon onClick={this.toggle} style={style.toggleIcon} className='material-icons'>{this.props.icon}</FontIcon>
        {this.state.open && this.getPopover()}
      </div>
    );
  }
}
