import React from 'react';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import FlatButton from 'material-ui/lib/flat-button';
import { Types } from 'src/vddf/schemadetector';
import AdaVizHelper from '../helpers/adaviz';

const style = {
  container: {
    padding: '4px 8px',
    height: 100
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
    this.setState(AdaVizHelper.extractMapping(this.props.vddf.visualization));
  }

  updateChart(type) {
    let viz = this.props.vddf.visualization;
    let mapping = this.state;

    this.props.vddf.visualization = AdaVizHelper.updateMapping(type, mapping, viz);
  };

  getFieldList(type) {
    return this.props.vddf.schema
      .filter(c => type == 'number' ? Types.isNumber(c.type) : true)
      .map(c => c.name);
  }

  changeChartType(type) {
    let vddf = this.props.vddf;
    this.updateChart(type);
  }

  getFieldDropdown(field, items) {
    const { key, label } = field;

    const onChange = (event, index, value) => {
      this.setState({[key]: value !== '--' ? value : ''});

      setTimeout(() => this.updateChart(), 300);
    };

    items = (items || this.getFieldList(field.type)).map(c => (
      <MenuItem key={c} value={c} primaryText={c} />
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
      {label: 'Measurement', key: 'measurement', type: 'number'},
      {label: 'Group By', key: 'category2'}
    ];

    // special treatment for some chart types
    switch (this.props.vddf.chartType) {
    case 'scatterplot':
      fields = [
        {label: 'X', key: 'category'},
        {label: 'Y', key: 'measurement', type: 'number'},
        {label: 'Group By', key: 'category2'}
      ];
      break;
    case 'pie':
    case 'donut':
      fields = [
        {label: 'Category', key: 'category'},
        {label: 'Measurement', key: 'measurement', type: 'number'}
      ];
      break;
    case 'heatmap':
      fields = [
        {label: 'Row', key: 'category'},
        {label: 'Column', key: 'category2'},
        {label: 'Measurement', key: 'measurement', type: 'number'}
      ];
      break;
    case 'datatable':
      fields = [];
      break;
    }

    let fieldComponents = fields.map(field => this.getFieldDropdown(field));

    return (
      <div style={style.container}>
        {this.getChartTypes()}
        <div>
          {fieldComponents}
          {this.getFieldDropdown({label: 'Aggregation', key: 'aggregation'}, ['sum', 'avg', 'min', 'max', 'count'])}
        </div>
      </div>
    );
  }
}
