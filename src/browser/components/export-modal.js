import React from 'react';
import Modal from './modal';

const style = {
  textarea: {
    width: '100%',
    height: '120px'
  },
  modalContent: {
    width: '570px'
  }
};

export default class ExportModal extends React.Component {
  render() {
    return (
      <Modal contentStyle={style.modalContent} open title='Export Chart' onRequestClose={this.props.onRequestClose}>
        <p>Please use the below code to embed the chart:</p>
        <textarea readOnly defaultValue={this.props.embedCode} style={style.textarea}></textarea>
      </Modal>
    );
  }
}
