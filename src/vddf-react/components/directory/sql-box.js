import React from 'react';
import AceEditor from './ace-editor';
import RaisedButton from 'material-ui/lib/raised-button';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import 'brace/mode/sql';
import 'brace/theme/sqlserver';
import 'brace/ext/language_tools';

export default class SqlBox extends React.Component {

  componentDidMount() {
    this.focus();
  }

  focus() {
    this.refs.editor.editor.focus();
  }

  render() {
    const height = 112;
    const hasError = !!this.props.error;

    return (
      <div className='sql-input-container'>
        <ReactCSSTransitionGroup transitionName='slidedown'
                                 transitionAppear={true}
                                 transitionAppearTimeout={300}
                                 transitionEnterTimeout={300}
                                 transitionLeaveTimeout={300}
                                 >
          <div className='sql-input' style={{height: height + (hasError ? 40 : 0)}}>
            <AceEditor
               ref='editor'
               width='100%'
               height={height + ''}
               fontSize={14}
               wrapEnabled={true}
               showPrintMargin={false}
               mode="sql"
               theme='sqlserver'
               name='sql-box'
               onChange={this.props.onChange}
               value={this.props.value}
               />

            <div className='run-button'>
              <RaisedButton backgroundColor='#448AFD' labelColor='white' label='RUN' onClick={this.props.onRun} />
            </div>

            <div className='error-message'>
              {this.props.error}
            </div>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
