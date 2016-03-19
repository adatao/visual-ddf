import React from 'react';
import FontIcon from 'material-ui/lib/font-icon';
import SqlBox from './sql-box';

export default class DirectoryHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 'txt',
      sql: ''
    };
  }

  onFilterChange = () => {
    const value = this.refs.search.value;

    if (/^\s*select/i.test(value)) {
      this.setState({
        mode: 'sql',
        sql: value
      });

      this.props.onFilter('');
    } else {
      this.props.onFilter(value);
    }
  };

  onSqlChange = (value) => {
    if (value === '') {
      this.setState({
        mode: 'txt'
      });

      this.props.onFilter('');

      // bad code start
      setTimeout(() => {
        this.refs.search.focus();
      }, 100);
      // bad code end ...
    }

    this.setState({
      sql: value
    });
  };

  onRun = () => {
    this.props.onSql(this.state.sql);

    // reset filter
    this.onSqlChange('');
  };

  renderInput() {
    return (
      <div className='search-input'>
        <span className='icon'>
          <FontIcon color='#9B9B9B' className='mdi mdi-magnify' />
        </span>
        <input ref='search' placeholder='Search for your Visual DDF' onChange={this.onFilterChange} />
      </div>
    );
  }

  renderSqlBox() {
    return (
      <SqlBox value={this.state.sql} onRun={this.onRun} onChange={this.onSqlChange}/>
    );
  }

  render() {
    return (
      <header>
        <div className='row'>
          <div className='col-xs-11'>
            <div className='title'>
              <h1>Visual DDF</h1>
            </div>
            {this.state.mode === 'txt' ? this.renderInput() : this.renderSqlBox()}
          </div>
          <div className='col-xs-1 profile'>
            <img src='avatar.png' width={40} />
          </div>
        </div>
      </header>
    );
  }
}
