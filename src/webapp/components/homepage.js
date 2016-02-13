import React from 'react';
import ReactDOM from 'react-dom';
import AppBar from 'material-ui/lib/app-bar';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import CircularProgress from 'material-ui/lib/circular-progress';

const style = {
  formContainer: {
    width: '640px',
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
    this.setState({
      loading: true
    });

    this.props.manager.load(this.refs.url.getValue())
      .then((vddf) => {
        let el = ReactDOM.findDOMNode(this.refs.vddf);
        vddf.render(el);

        this.setState({
          loading: false
        });
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
           iconElementLeft={null}
           title="Visual DDF"
           />
        <div style={style.formContainer}>
          <TextField ref='url' hintText="Paste a vDDF link or CSV link to start." style={style.urlInput} />
          <RaisedButton onClick={this.handleClick} disabled={this.state.loading} label="Go" />
          {this.state.loading && this.renderLoadingBlock()}
          <div ref="vddf" style={{marginTop: '15px'}}></div>
        </div>
      </div>
    );
  }
}
