import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import ReactDataGrid, { Toolbar } from 'react-data-grid/addons';
import RaisedButton from 'material-ui/lib/raised-button';
import FlatButton from 'material-ui/lib/flat-button';
import Modal from './modal';
import autobind from 'autobind-decorator';

export default class DataEditModal extends React.Component {
  static propTypes = {
    vddf: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      rows: [],
      columns: []
    };
  }

  componentDidMount() {
    require('react-data-grid/themes/react-data-grid.css');
    let vddf = this.props.vddf;

    const columns = vddf.schema.map((c,i) => {
      return {
        name: c.name,
        type: c.type,
        key: String(i),
        editable: true
      };
    });

    this.setState({
      rows: vddf.fetch().concat([this.newRow()]),
      columns: columns
    });
  }

  newRow() {
    return this.state.columns.reduce((obj, value, index) => {
      return obj.concat(['']);
    }, []);
  }

  @autobind
  handleRowUpdate(e) {
    let rows = this.state.rows;
    Object.assign(rows[e.rowIdx], e.updated);

    // if user is editing the last row, and it is not empty then add new column
    if (e.rowIdx === rows.length - 1 && rows[e.rowIdx].join('') !== '') {
      rows.push(this.newRow());
    }

    this.setState({rows: rows});
  }

  @autobind
  handleAddRow(e) {
    let rows = this.state.rows;
    let row = this.newRow();

    rows.push(row);

    this.setState({
      rows: rows
    });
  }

  @autobind
  handleAddColumn(e) {
    // TODO: need better UX
    let columnName = prompt('Please enter column name');
    let columns = this.state.columns;

    // check if column exist
    const hasColumn = columns.some(c => c.name == columnName);

    if (hasColumn) {
      alert('Column name is taken');
    } else if (columnName) {
      this.setState({
        columns: columns.concat({
          name: columnName,
          type: 'text',
          key: columns.length,
          editable: true
        })
      });
    }
  }

  @autobind
  getRow(i) {
    return this.state.rows[i].reduce((obj, value, index) => {
      return Object.assign(obj, {
        [index]: value
      });
    }, {});
  }

  @autobind
  saveData() {
    let schema = this.state.columns.map(c => {
      return {
        name: c.name,
        type: c.type
      };
    });

    // skip the last row, because it's just placeholder
    this.props.onSave(this.state.rows.slice(0, this.state.rows.length - 1), schema);
  }

  getActions() {
    return (
      <div>
        <RaisedButton onClick={this.props.onRequestClose} label='Cancel'/>
        &nbsp;
        <RaisedButton onClick={this.saveData} label='Save' backgroundColor='#2962fd' labelColor='white'/>
      </div>
    );
  }

  render() {
    if (this.state.columns.length == 0) {
      return (<div></div>);
    }

    // TODO: detect height by window height
    return (
      <Modal open actions={this.getActions()} title='Edit Data'  onRequestClose={this.props.onRequestClose}>
        <div style={{textAlign: 'right'}}>
          <FlatButton onClick={this.handleAddRow} label="Add Row"/>
          <FlatButton onClick={this.handleAddColumn} label="Add Column"/>
        </div>
        <ReactDataGrid
           columns={this.state.columns}
           rowsCount={this.state.rows.length}
           rowGetter={this.getRow}
           onRowUpdated={this.handleRowUpdate}
           enableCellSelect={true}
           minHeight={400} />
      </Modal>
    );
  }
}
