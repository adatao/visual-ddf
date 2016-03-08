import React from 'react';
import ReactDOM from 'react-dom';
import AppBar from 'material-ui/lib/app-bar';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import CircularProgress from 'material-ui/lib/circular-progress';
import Dropzone from 'react-dropzone';

const style = {
  formContainer: {
    width: '700px',
    margin: '50px auto 150px'
  },
  urlInput: {
    width: '80%',
    marginRight: '5px'
  },
  loadingBlock: {
    textAlign: 'center',
    margin: '20px 0'
  },
  dropzone: {
    width: 700,
    height: 48
  },
  dropzoneActive: {
    color: 'black',
    paddingTop: 8,
    border: '1px dashed silver',
    textAlign: 'center',
    fontFamily: 'Helvetica, Arial',
    color: '#ccc'
  },
  dropzoneCancelButton: {
    fontSize: '0.75em',
    color: '#999',
    cursor: 'pointer'
  }
};

export default class Homepage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  handleClick = () => {
    const url = this.refs.url.getValue();

    if (!url) {
      return;
    }

    this.loadAndRendervDDF(url);
  };

  handleFileDrop = (file) => {
    this.setState({fileActive: false});
    this.loadAndRendervDDF(file);
  };

  loadAndRendervDDF(url) {
    this.setState({
      loading: true
    });

    this.props.manager.load(url)
      .then((vddf) => {
        this.setState({
          loading: false
        });

        let el = ReactDOM.findDOMNode(this.refs.vddf);
        vddf.render(el);
      })
      .catch(err => {
        alert(err);

        console.log(err.stack || err);

        this.setState({
          loading: false
        });
      });
  }

  renderLoadingBlock() {
    return (
      <div style={style.loadingBlock}>
        <CircularProgress size={0.5} />
      </div>
    );
  }

  renderInput() {
    let input;

    if (this.state.fileActive) {
      input = (
        <div>Drag the file here to continue.</div>
      );
    } else {
      input = (
        <div>
          <TextField ref='url' hintText="Paste a CSV link or drop a file to start." style={style.urlInput} />
          <RaisedButton onClick={this.handleClick} disabled={this.state.loading} label="Go" />
        </div>
      );
    }

    return (
      <div onDragLeave={() => this._resetDropzone()}>
        <Dropzone ref='dropzone' disableClick disablePreview multiple={false} style={style.dropzone}
                  activeStyle={style.dropzoneActive}
                  onDragEnter={() => this.setState({fileActive: true})}
          onDrop={this.handleFileDrop}>
          {input}
        </Dropzone>
      </div>
    );
  }

  _resetDropzone() {
    this.setState({ fileActive: false });
    // https://github.com/okonet/react-dropzone/issues/140
    this.refs.dropzone.setState({ isDragActive: false });
  }

  render() {
    return (
      <div>
        <AppBar
           iconElementLeft={<span />}
           title="Visual DDF"
           />
        <div style={style.formContainer}>
          {this.renderInput()}
          {this.state.loading && this.renderLoadingBlock()}
          <div ref="vddf" style={{marginTop: '15px', display: this.state.loading ? 'none' : 'block'}}></div>
        </div>
      </div>
    );
  }
}

export default Homepage;
