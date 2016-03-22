import React from 'react';

export default class SidebarItem extends React.Component {

  static contextTypes = {
    baseUrl: React.PropTypes.string
  };

  render() {
    const isChecked = this.props.checked;
    const baseUrl = this.context.baseUrl;
    const chart = this.props.chart;
    let preview;

    let overlay;

    if (isChecked) {
      overlay = (
        <div className='overlay'>
          <span className='check-icon'>
            <img src={baseUrl + '/check-circle.svg'} />
          </span>
        </div>
      );
    }

    if (chart.type === 'table') {
      preview = (
        <div style={{margin: '24px 16px 16px 16px', textAlign: 'center'}}>
          <img style={{width: 64, margin: '0 auto', display: 'inline-block'}} src={baseUrl + '/table.png'}/>
          <p style={{marginTop: 16, height: 32, overflow: 'hidden', textOverflow: 'ellipsis'}}>{chart.title}</p>
        </div>
      );
    } else {
      const imgUrl = chart.previewUrl;
      preview = <img width='100%' src={imgUrl} />;
    }

    return (
      <div onClick={this.props.onClick} className='vddf-chart-preview'>
        {overlay}
        <div className='img'>
          {preview}
        </div>
      </div>
    );
  }
}
