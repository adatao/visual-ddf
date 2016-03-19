import React from 'react';
import Header from './directory-header';
import Item from './directory-item';
import ItemDetail from './item-detail';
import fuzzysearch from 'fuzzysearch';

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
    let resultVddf;

    return this.props.storage.sql(query)
      .then(result => {
        const schema = Object.keys(result.rows[0]).map(c => ({name: c}));
        const data = [].slice.call(result.rows).map(r => {
          return schema.map(c => r[c.name]);
        });

        // TODO: sanitize column name

        return this.props.manager.load({
          schema,
          data,
          source: 'sql',
          visualization: {
            type: 'datatable',
            sql: query
          }
        });
      })
      .then(vddf => {
        resultVddf = vddf;
        return this.props.manager.export(vddf);
      })
      .then(r => {
        return this.props.storage.create({
          uuid: r.uuid,
          name: 'untitled', // need a better name :(
          title: 'My query',
          schema: resultVddf.schema,
          data: resultVddf.fetch()
        });
      })
      .then(() => {
        this.props.reload();
      });
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
        <ItemDetail screenWidth={this.props.screenWidth} arrowOffset={selectedIndex % 4} key='detail' chart={chart} />
      );

      charts.splice(Math.ceil((selectedIndex+1) / 4)*4, 0, detailView);
    }

    return (
      <div className='directory'>
        <Header onFilter={this.handleKeywordChange}
                onSql={this.handleSqlRequest}
                />
        <div className='chart-list'>
          {charts}
        </div>
      </div>
    );
  }
}
