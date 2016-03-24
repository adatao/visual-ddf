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

  componentWillUnmount() {
    if (this.props.global && typeof document) {
      document.removeEventListener('dragenter', this.onDragEnter);
      document.removeEventListener('dragover', this.onDragOver);
      document.removeEventListener('dragleave', this.onDragLeave);
      // document.removeEventListener('drop', this.onDrop);
    }
  }
}
