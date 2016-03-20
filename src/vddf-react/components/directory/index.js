import React from 'react';
import Header from './directory-header';
import Item from './directory-item';
import ItemDetail from './item-detail';
import fuzzysearch from 'fuzzysearch';
import RaisedButton from 'material-ui/lib/raised-button';
import FontIcon from 'material-ui/lib/font-icon';

export default class Directory extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selected: -1
    };
  }

  static childContextTypes = {
    manager: React.PropTypes.object,
    storage: React.PropTypes.object
  };

  getChildContext() {
    return {
      manager: this.props.manager,
      storage: this.props.storage
    };
  }

  clickChart(c, i) {
    this.setState({
      selected: this.state.selected !== i ? i : -1
    });
  };

  handleKeywordChange = (value) => {
    this.setState({
      keyword: value,
      selected: -1
    });
  };

  handleSqlRequest = (query) => {
    const storage = this.props.storage;
    let resultVddf;

    return storage.sql(query)
      .then(result => {
        if (result.rows.length === 0) {
          throw new Error('Your query has empty result.');
        }

        const schema = Object.keys(result.rows[0]).map(c => ({name: c}));
        const data = [].slice.call(result.rows).map(r => {
          return schema.map(c => r[c.name]);
        });

        // TODO: sanitize column name here

        return this.props.manager.load({
          schema,
          data,
          title: 'My query',
          source: 'sql',
          visualization: {
            type: 'datatable',
            sql: query
          }
        });
      })
      .then(vddf => {
        return storage.createFromVDDF(vddf, { name: 'untitled' });
      })
      .then(() => {
        this.props.reload();
      });
  };

  selectFile = () => {
    this.refs.file.value = '';
    this.refs.file.click();
  };

  onFileChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];

    if (file) {
      this.props.manager.load(file)
        .then(vddf => {
          return this.props.storage.createFromVDDF(vddf);
        })
        .then(() => {
          this.props.reload();
        })
        .catch(err => {
          alert('Oops, there was an error: ' + err.message);
          console.log(err);
        });
    }
  };

  render() {
    let charts = this.props.charts;

    if (this.state.keyword) {
      charts = charts.filter(c => {
        return fuzzysearch(this.state.keyword, c.name);
      });
    }

    charts = charts.map((c,i) => {
      return <Item key={i} chart={c} name={c.name} onClick={() => this.clickChart(c, i)} />;
    });

    // we hardcode only 4 items per grid now
    if (this.state.selected !== -1) {
      const chart = this.props.charts[this.state.selected];
      const selectedIndex = this.state.selected;
      const detailView = (
        <ItemDetail preview={charts[this.state.selected]} screenWidth={this.props.screenWidth} arrowOffset={selectedIndex % 4} key='detail' chart={chart} />
      );

      charts.splice(Math.ceil((selectedIndex+1) / 4)*4, 0, detailView);
    }

    const uploadIcon = <FontIcon className='mdi mdi-plus' />;

    return (
      <div className='directory'>
        <Header onFilter={this.handleKeywordChange}
                onSql={this.handleSqlRequest}
                />
        <div className='chart-list'>
          <div style={{margin: '8px 0 12px'}}>
            <RaisedButton label='Upload' backgroundColor='#448AFD' labelColor='white' icon={uploadIcon} onClick={this.selectFile} />
            <input type='file' style={{display: 'none'}} ref='file' onChange={this.onFileChange} />
          </div>
          {charts}
        </div>
      </div>
    );
  }
}
