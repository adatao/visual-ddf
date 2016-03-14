import React from 'react';

const style = {
  container: {
    position: 'fixed',
    right: 0,
    top: 0,
    width: '300px',
    height: '100%',
    background: 'white',
    borderLeft: '1px solid silver',
    padding: '8px',
    zIndex: 9999 // over 9000!
  }
};

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
    return <div style={style.container}>
      <button onClick={this.props.closeSidebar}>Close</button>
    </div>;
  }
}
