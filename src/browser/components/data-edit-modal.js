import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import ReactDataGrid, { Toolbar } from 'react-data-grid/addons';
import RaisedButton from 'material-ui/lib/raised-button';
import Modal from './modal';
import autobind from 'autobind-decorator';

const style = {

};

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

    const columns = vddf.getSchema().map((c,i) => {
      return {
        name: c.name,
        key: String(i),
        editable: true
      };
    });

    const data = vddf.fetch();

    this.setState({
      rows: data,
      columns: columns
    });
  }

  @autobind
  handleRowUpdate(e) {
    let rows = this.state.rows;
    Object.assign(rows[e.rowIdx], e.updated);
    this.setState({rows: rows});
  }

  @autobind
  handleAddRow(e) {
    let rows = this.state.rows;
    let row = this.state.columns.reduce((obj, value, index) => {
      return obj.concat(['']);
    }, []);

    rows.push(row);

    this.setState({
      rows: rows
    });
  }

  @autobind
  getRow(i) {
    return this.state.rows[i].reduce((obj, value, index) => {
      return Object.assign(obj, {
        [index]: value
      });
    }, {});
  }

  getToolbar() {
    return (
      <Toolbar onAddRow={this.handleAddRow} />
    );
  }

  getActions() {
    return (
      <div>
        <RaisedButton onClick={this.props.onRequestClose} label='Cancel'/>
        &nbsp;
        <RaisedButton onClick={() => this.props.onSave(this.state.rows)} label='Save' backgroundColor='#2962fd' labelColor='white'/>
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
        <ReactDataGrid
           columns={this.state.columns}
           rowsCount={this.state.rows.length}
           rowGetter={this.getRow}
           onRowUpdated={this.handleRowUpdate}
           enableCellSelect={true}
           toolbar={this.getToolbar()}
           minHeight={400} />
      </Modal>
    );
  }
}
