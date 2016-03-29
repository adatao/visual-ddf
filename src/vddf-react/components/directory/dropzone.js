import ReactDropZone from 'react-dropzone';

// ref: https://github.com/olalonde/react-dropzone/blob/master/src/index.js
export default class DropZone extends ReactDropZone {
  componentWillMount() {
    if (this.props.global && typeof document) {
      document.addEventListener('dragenter', this.onDragEnter);
      document.addEventListener('dragover', this.onDragOver);
      document.addEventListener('dragleave', this.onDragLeave);
      // document.addEventListener('drop', this.onDrop);
    }
  }

  onDragEnter(e) {
    const dataTransferItems = e.dataTransfer && e.dataTransfer.items ? e.dataTransfer.items : [];
    const hasFile = [].slice.call(dataTransferItems).filter(x => x.kind === 'file').length;

    if (hasFile) {
      super.onDragEnter(e);
    }
  }

  onDragLeave(e) {
    const dataTransferItems = e.dataTransfer && e.dataTransfer.items ? e.dataTransfer.items : [];
    const hasFile = [].slice.call(dataTransferItems).filter(x => x.kind === 'file').length;

    if (hasFile) {
      super.onDragLeave(e);
    }
  }

  componentWillUnmount() {
    if (this.props.global && typeof document) {
      document.removeEventListener('dragenter', this.onDragEnter);
      document.removeEventListener('dragover', this.onDragOver);
      document.removeEventListener('dragleave', this.onDragLeave);
      // document.removeEventListener('drop', this.onDrop);
    }
  }
}
