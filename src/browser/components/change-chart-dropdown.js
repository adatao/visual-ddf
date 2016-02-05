import React from 'react';
import Popover from './popover';
import FlatButton from 'material-ui/lib/flat-button';

const style = {
  popoverPaper: {
    minWidth: '208px',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '8px',
    paddingRight: '8px',
    boxSizing: 'border-box'
  },
  heading: {
    margin: '8px 8px 16px',
    color: '#222',
    fontWeight: 'normal'
  },
  chartButtonContainer: {
    display: 'inline-block',
    overflow: 'hidden'
  },
  chartButton: {
    width: 96,
    height: 96,
    minWidth: 'auto',
    textTransform: 'none'
  },
  chartLabel: {
    display: 'block',
    fontSize: 12,
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  chartIcon: {
    marginTop: 2,
    maxWidth: 64,
    height: 64
  }
};

export default class ChangeChartDropdown extends React.Component {
  static propTypes = {
    charts: React.PropTypes.array.isRequired,
    onRequestClose: React.PropTypes.func
  };

  static contextTypes = {
    baseUrl: React.PropTypes.string
  };

  getChartButton(type) {
    const baseUrl = this.context.baseUrl;
    const iconUrl = `${baseUrl}chart-icons/${type}.svg`;
    const onClick = (...args) => {
      this.props.onClick(type, ...args);
    };

    return (
      <div style={style.chartButtonContainer} key={type}>
        <FlatButton onClick={onClick} style={style.chartButton}>
          <img src={iconUrl} style={style.chartIcon} />
          <span style={style.chartLabel}>{type}</span>
        </FlatButton>
      </div>
    );
  }

  render() {
    const items = this.props.charts.map(type => this.getChartButton(type));

    return (
      <Popover paperStyle={style.popoverPaper} icon='assessment' onRequestClose={this.props.onRequestClose}>
        <h4 style={style.heading}>Recommended Charts</h4>
        {items}
      </Popover>
    );
  }
}
