import React from 'react';
import Item from './directory-item';
import ItemDetail from './item-detail';

export default class DirectoryContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: -1,
      preview: {}
    };
  }

  static contextTypes = {
    storage: React.PropTypes.object
  };

  updatePreview = (chart, preview) => {
    const current = this.state.preview;

    if (current[chart.uuid] !== preview) {
      if (this.context.storage) {
        this.context.storage.updatePreview(chart.uuid, preview);
      }

      this.setState({
        preview: {
          ...current,
          [chart.uuid]: preview
        }
      });
    }
  }

  clickChart(c, i) {
    this.setState({
      selected: this.state.selected !== i ? i : -1
    });
  };

  render() {
    let charts = this.props.charts;

    charts = charts.map((c,i) => {
      return <Item key={i} preview={this.state.preview[c.uuid]} chart={c} name={c.name} onClick={() => this.clickChart(c, i)} />;
    });

    // we hardcode only 4 items per grid now
    if (this.state.selected !== -1) {
      const chart = this.props.charts[this.state.selected];
      const selectedIndex = this.state.selected;
      const detailView = (
        <ItemDetail updatePreview={this.updatePreview} screenWidth={this.props.screenWidth} screenHeight={this.props.screenHeight} arrowOffset={selectedIndex % 4} key='detail' chart={chart} />
      );

      charts.splice(Math.ceil((selectedIndex+1) / 4)*4, 0, detailView);
    }

    return (
      <div>{charts}</div>
    );
  }
}
