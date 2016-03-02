import React from 'react';
import Modal from './modal';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';

const style = {
  textarea: {
    width: '100%',
    height: '100px',
    fontSize: '1em'
  },
  modalContent: {
    width: '570px'
  }
};

export default class ExportModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 'link'
    };
  }

  render() {
    let code = '';

    switch (this.state.mode) {
    case 'link':
      code = this.props.embed.link;
      break;
    case 'image':
      code = this.props.embed.image;
      break;
    default:
      code = this.props.embed.embedCode;
    }

    return (
      <Modal contentStyle={style.modalContent} open title='Export Chart' onRequestClose={this.props.onRequestClose}>
        <p style={{marginBottom: 0}}>Please use the below code to embed the chart:</p>
        <SelectField
           value={this.state.mode}
           onChange={(event, index, value) => this.setState({mode: value})}
           floatingLabelText="Mode"
           >
          <MenuItem key='link' value="link" primaryText="Link"/>
          <MenuItem key='html' value="html" primaryText="HTML"/>
          <MenuItem key='image' value="image" primaryText="Image"/>
        </SelectField>
        <textarea readOnly value={code} style={style.textarea}></textarea>
      </Modal>
    );
  }
}
