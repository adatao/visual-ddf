import React from 'react';

const style = {
  container: {
    width: 370
  }
};

export default class Sidebar extends React.Component {
  render() {
    return (
      <div style={style.container} className='vddf-chart-sidebar'>
        Hello i am sidebar ^^
      </div>
    );
  }
}
