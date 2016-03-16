import React from 'react';
import RaisedButton from 'material-ui/lib/raised-button';
import ChartPreview from './chart-preview';

const style = {
  container: {
    position: 'fixed',
    right: 0,
    top: 0,
    width: '330px',
    height: '100%',
    background: '#F7F7F7',
    boxShadow: '0px 2px 4px 0px rgba(0,0,0,0.50)',
    padding: '10px',
    zIndex: 9999 // over 9000!
  },
  actionButtons: {
    textAlign: 'right'
  }
};

export default class Sidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedCharts: {}
    };
  }

  static childContextTypes = {
    baseUrl: React.PropTypes.string
  };

  toggleChart = (chart) => {
    const selectedCharts = this.state.selectedCharts;

    if (selectedCharts[chart]) {
      delete selectedCharts[chart];
    } else {
      selectedCharts[chart] = 1;
    }

    this.setState({
      selectedCharts
    });
  };

  save = () => {
    this.props.closeSidebar();
  };

  getChildContext() {
    return {
      baseUrl: this.props.baseUrl
    };
  }

  render() {
    const availableCharts = this.props.charts;
    const charts = availableCharts.map((c, key) => {
      const isChecked = this.state.selectedCharts[key];

      return <ChartPreview key={key} chart={c} checked={isChecked} onClick={() => this.toggleChart(key)} />;
    });

    return (
      <div className='vddf-sidebar' style={style.container}>
        <div>
          <h4>Visual DDF</h4>
          <h6>Choose the charts you want:</h6>
        </div>
        <div className='charts-container'>
          {charts}
        </div>
        <div style={style.actionButtons}>
          <RaisedButton
             backgroundColor='#D9D9D9'
             labelColor='white'
             label='Close'
             onClick={this.props.closeSidebar} />
          &nbsp;&nbsp;
          <RaisedButton
             backgroundColor='#07AE88'
             labelColor='white'
             label='Save'
             onClick={this.save} />
        </div>
      </div>
    );
  }
}
