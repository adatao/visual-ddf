import React from 'react';
import RaisedButton from 'material-ui/lib/raised-button';
import SidebarItem from './sidebar-item';

const style = {
  container: {
    position: 'fixed',
    right: 0,
    top: 0,
    width: '330px',
    height: '100%',
    background: '#F7F7F7',
    boxShadow: '0px 2px 4px 0px rgba(0,0,0,0.50)',
    padding: '10px'
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
    const selectedCharts = this.props.charts.filter((c,key) => {
      return this.state.selectedCharts[key];
    });

    if (selectedCharts.length === 0) {
      this.props.closeSidebar();
    } else {
      this.props.onSubmit(selectedCharts);
    }
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

      return <SidebarItem key={key} chart={c} checked={isChecked} onClick={() => this.toggleChart(key)} />;
    });

    return (
      <div className='vddf-sidebar' style={style.container}>
        <div style={{position: 'relative'}}>
          <h4>
            <img src={this.props.baseUrl + '/logo_black.svg'} />
          </h4>
          <h6>Choose the charts you want:</h6>

          <img onClick={this.props.closeSidebar} title='Close' style={{position: 'absolute', top: 8, right: 8, cursor: 'pointer'}} src={this.props.baseUrl + '/close.png'} width={16} height={16}  />
        </div>
        <div className='charts-container'>
          {charts}
        </div>
        <div style={style.actionButtons}>
          <RaisedButton
             backgroundColor='#07AE88'
             labelColor='white'
             label='Send to My Arimo'
             onClick={this.save} />
        </div>
      </div>
    );
  }
}
