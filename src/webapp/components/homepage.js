import React from 'react';
import ReactDOM from 'react-dom';
import AppBar from 'material-ui/lib/app-bar';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import CircularProgress from 'material-ui/lib/circular-progress';

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

        this.setState({
          loading: false
        });
      });
  };

  renderLoadingBlock() {
    return (
      <div style={style.loadingBlock}>
        <CircularProgress size={0.5} />
      </div>
    );
  }

  render() {
    return (
      <div>
        <AppBar
           iconElementLeft={<span />}
           title="Visual DDF"
           />
        <div style={style.formContainer}>
          <TextField ref='url' hintText="Paste a vDDF link or CSV link to start." style={style.urlInput} />
          <RaisedButton onClick={this.handleClick} disabled={this.state.loading} label="Go" />
          {this.state.loading && this.renderLoadingBlock()}
          <div ref="vddf" style={{marginTop: '15px', display: this.state.loading ? 'none' : 'block'}}></div>
        </div>
      </div>
    );
  }
}
