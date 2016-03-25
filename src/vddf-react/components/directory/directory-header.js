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
    const value = this.refs.search.value || '';

    if (/^\s*select/i.test(value)) {
      this.setState({
        mode: 'sql',
        sql: value,
        error: ''
      });

      // this.props.onFilter('');
    } else {
      if (!value || "select".indexOf(value.toLowerCase()) !== 0) {
        this.props.onFilter(value);
      }
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
    this.props.onSql(this.state.sql)
      .then(() => {
        // we are done now, so just reset filter
        this.onSqlChange('');
      })
      .catch(e => {
        this.setState({
          error: e.message
        });

        this.refs.sqlbox.focus();
      });
  };

  renderInput() {
    return (
      <div className='search-input'>
        <span className='icon'>
          <FontIcon color='#9B9B9B' className='mdi mdi-magnify' />
        </span>
        <input ref='search' placeholder='Search or Use SQL on your Visual DDF' onChange={this.onFilterChange} />
      </div>
    );
  }

  renderSqlBox() {
    return (
      <SqlBox ref='sqlbox' value={this.state.sql} error={this.state.error} onRun={this.onRun} onChange={this.onSqlChange}/>
    );
  }

  render() {
    return (
      <header>
        <div className='row'>
          <div className='col-xs-11'>
            <div className='title'>
              <img src='logo.svg' height={36} />
            </div>
            {this.state.mode === 'txt' ? this.renderInput() : this.renderSqlBox()}
          </div>
          <div className='col-xs-1 profile'>
            <img src={this.props.avatarUrl} width={36} />
          </div>
        </div>
      </header>
    );
  }
}
