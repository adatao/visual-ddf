import React from 'react';

export default class Item extends React.Component {
  render() {
    return (
      <div onClick={this.props.onClick} className='vddf-chart-preview'>
        <div>
          <img width='100%' src='http://localhost:5001/chromeapp/preview1.png' />
        </div>
        <div className='title'>
          {this.props.title}
        </div>
      </div>
    );
  }
}
