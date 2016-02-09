import React from 'react';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

const style = {
  container: {
    padding: '4px 8px'
  }
};

export default class ChartSettings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const viz = this.props.vddf.visualization;
    const category = viz.category || viz.x;
    const measurement = viz.measurement || viz.y;
    const category2 = viz.category2 || viz.color || viz.detail;

    this.setState({category, measurement, category2});
  }

  updateChart() {
    let viz = this.props.vddf.visualization;
    let update = this.state;

    viz.x = update.category;
    viz.y = update.measurement;
    viz.color = update.category2;


    if (!viz.color) delete viz.color;
    delete viz.xLabel;
    delete viz.yLabel;
    delete viz.measurementColumns;

    // additional handling
    switch (viz.type) {
    case 'treemap':

      break;
    }

    this.props.vddf.visualization = viz;
  };

  getFieldDropdown(label, key) {
    const onChange = (event, index, value) => {
      this.setState({[key]: value});

      setTimeout(() => this.updateChart(), 300);
    };

    const items = this.props.vddf.schema.map(c => (
      <MenuItem key={c.name} value={c.name} primaryText={c.name} />
    ));

    return (
      <SelectField style={{width: '32%', marginRight: '1%', verticalAlign: 'top'}} floatingLabelText={label} value={this.state[key]} onChange={onChange}>
        <MenuItem value='' primaryText='' />
        {items}
      </SelectField>
    );
  }

  render() {
    return (
      <div style={style.container}>
        {this.getFieldDropdown('Category', 'category')}
        {this.getFieldDropdown('Measurement', 'measurement')}
        {this.getFieldDropdown('Group By', 'category2')}
      </div>
    );
  }
}
