import React from 'react';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import FlatButton from 'material-ui/lib/flat-button';

const style = {
  container: {
    padding: '4px 8px'
  },
  chartButton: {
    width: 28,
    height: 28,
    minWidth: 'auto',
    textAlign: 'center'
  },
  chartIcon: {
    padding: 0,
    height: 20,
    maxWidth: 20
  },
  fieldDropdown: {
    width: '24%',
    marginRight: '1%',
    verticalAlign: 'top'
  }
};

export default class ChartSettings extends React.Component {
  static contextTypes = {
    baseUrl: React.PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    let viz = this.props.vddf.visualization;
    let mapping = viz.mapping || viz;

    const category = mapping.category || (viz.orientation === 'horizontal' ? viz.y : viz.x);
    const measurement = mapping.measurement || (viz.orientation === 'horizontal' ? viz.x : viz.y);
    const category2 = mapping.category2 || viz.color || viz.detail;
    const aggregation = mapping.aggregation;

    this.setState({category, measurement, category2, aggregation});
  }

  updateChart(type) {
    let viz = this.props.vddf.visualization;
    let update = this.state;

    viz.mapping = update;

    if (type) {
      viz.type = type;
    }

    if (viz.type == 'heatmap') {
      viz.y = update.category;
      viz.x = update.category2;
      viz.color = update.measurement;
    } else {
      if (viz.orientation === 'horizontal') {
        viz.y = update.category;
        viz.x = update.measurement;
      } else {
        viz.x = update.category;
        viz.y = update.measurement;
      }

      viz.color = update.category2;
    }

    viz.aggregation = update.aggregation;


    if (!viz.color) delete viz.color;
    delete viz.xLabel;
    delete viz.yLabel;
    delete viz.measurementColumns;

    this.props.vddf.visualization = viz;
  };

  changeChartType(type) {
    let vddf = this.props.vddf;
    this.updateChart(type);
  }

  getFieldDropdown(label, key, items) {
    const onChange = (event, index, value) => {
      this.setState({[key]: value !== '--' ? value : ''});

      setTimeout(() => this.updateChart(), 300);
    };

    items = (items || this.props.vddf.schema).map(c => (
      <MenuItem key={c.name} value={c.name} primaryText={c.name} />
    ));

    return (
      <SelectField key={key} style={style.fieldDropdown} floatingLabelText={label} value={this.state[key]} onChange={onChange}>
        <MenuItem value='--' primaryText='(none)' />
        {items}
      </SelectField>
    );
  }

  getChartTypes() {
    const baseUrl = this.context.baseUrl;

    const types = this.props.vddf.getAvailableCharts().map(type => (
      <FlatButton onClick={() => this.changeChartType(type)} key={type} style={style.chartButton}>
        <img style={style.chartIcon} src={`${baseUrl}chart-icons/${type}.svg`} />
      </FlatButton>
    ));

    return (
      <div>
        {types}
      </div>
    );
  }

  render() {
    let fields = [
      {label: 'Category', key: 'category'},
      {label: 'Measurement', key: 'measurement'},
      {label: 'Group By', key: 'category2'}
    ];

    // special treatment for some chart types
    switch (this.props.vddf.getChartType()) {
    case 'scatterplot':
      fields = [
        {label: 'X', key: 'category'},
        {label: 'Y', key: 'measurement'},
        {label: 'Group By', key: 'category2'}
      ];
      break;
    case 'pie':
    case 'donut':
      fields = [
        {label: 'Category', key: 'category'},
        {label: 'Measurement', key: 'measurement'}
      ];
      break;
    case 'heatmap':
      fields = [
        {label: 'Row', key: 'category'},
        {label: 'Column', key: 'category2'},
        {label: 'Measurement', key: 'measurement'}
      ];
      break;
    case 'datatable':
      fields = [];
      break;
    }

    let fieldComponents = fields.map(field => this.getFieldDropdown(field.label, field.key));

    return (
      <div style={style.container}>
        {this.getChartTypes()}
        <div>
          {fieldComponents}
          {this.getFieldDropdown('Aggregation', 'aggregation', ['sum', 'avg', 'min', 'max'].map(c => ({name: c})))}
        </div>
      </div>
    );
  }
}
