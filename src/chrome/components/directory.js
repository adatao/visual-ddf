import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';
import Item from './directory-item';
import ItemDetail from './item-detail';

export default class Directory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: -1
    };
  }

  clickChart(c, i) {
    this.setState({
      selected: this.state.selected !== i ? i : -1
    });
  };

  render() {
    const availabelCharts = [1,2,3,4,5,6,7,8,9,10,11];
    const charts = availabelCharts.map((c,i) => {
      return <Item key={c} title={'Chart ' + (c)} onClick={() => this.clickChart(c, i)} />;
    });

    // we hardcode only 4 items per grid now
    if (this.state.selected !== -1) {
      const selectedIndex = this.state.selected;
      const detailView = (
        <ItemDetail arrowOffset={selectedIndex % 4} key='detail' />
      );

      charts.splice(Math.ceil((selectedIndex+1) / 4)*4, 0, detailView);
    }

    return (

      <div className='directory'>
        <header>
          <div className='row'>
            <div className='col-xs-11'>
              <div className='title'>
                <h1>Visual DDF</h1>
              </div>
              <div className='search-input'>
                <span className='icon'>
                  <FontIcon color='#9B9B9B' className='material-icons'>search</FontIcon>
                </span>
                <input placeholder='Search for your Visual DDF' />
              </div>
            </div>
          <div className='col-xs-1 profile'>
            <img src='avatar.png' width={40} />
          </div>
          </div>
        </header>
        <div className='chart-list'>
          {charts}
        </div>
      </div>
    );
  }
}
