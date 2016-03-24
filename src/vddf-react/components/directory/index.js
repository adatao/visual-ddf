import React from 'react';
import Header from './directory-header';
import Item from './directory-item';
import ItemDetail from './item-detail';
import fuzzysearch from 'fuzzysearch';
import RaisedButton from 'material-ui/lib/raised-button';
import FontIcon from 'material-ui/lib/font-icon';
import Content from './content';
import DropZone from './dropzone';

const style = {
  dropzone: {
    position: 'fixed',
    left: 0,
    top: 40,
    right: 0,
    bottom: 0,
    display: 'none',
    background: 'rgba(68, 138, 253, 0.3)',
    border: '4px solid #448AFD',
    zIndex: 10000
  },

  dropzoneActive: {
    display: 'block'
  },

  dropzoneBox: {
    background: '#448AFD',
    color: 'white',
    position: 'absolute',
    left: '50%',
    top: '10px',
    borderRadius: '2px',
    boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.50)',
    width: 230,
    height: 40,
    lineHeight: '40px',
    marginLeft: -115,
    fontSize: '14',
    textAlign: 'center'
  }
};

export default class Directory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
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

  handleKeywordChange = (value) => {
    this.setState({
      keyword: value
    });

    this.refs.content.deselect();
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
        this.reload();
      });
  };

  dropFile = (files) => {
    const file = files[0];

    if (file) {
      this.props.manager.load(file)
        .then(vddf => {
          return this.props.storage.createFromVDDF(vddf);
        })
        .then(() => {
          this.reload();
        })
        .catch(err => {
          alert('Oops, there was an error: ' + err.message);
          console.log(err);
        });
    }
  };

  reload() {
    this.props.reload();
    this.refs.content.deselect();
  }

  render() {
    let charts = this.props.charts;

    if (this.state.keyword) {
      charts = charts.filter(c => {
        return fuzzysearch(this.state.keyword, c.name);
      });
    }

    return (
      <div className='vddf-directory'>
        <Header onFilter={this.handleKeywordChange}
                onSql={this.handleSqlRequest}
                />
        <div className='chart-list'>
          <DropZone global onDrop={this.dropFile}
                    onDragEnter={() => this.setState({fileActive: true})}
                    onDragLeave={() => this.setState({fileActive: false})}
                    style={style.dropzone}
                    activeStyle={style.dropzoneActive}
            >
            <div style={style.dropzoneBox}>
              Drag your dataset to upload <span className='mdi mdi-upload'/>
            </div>
          </DropZone>
          <Content ref='content' charts={charts}
                   initialSelect={this.props.initialSelect}
                   screenWidth={this.props.screenWidth}
                   screenHeight={this.props.screenHeight} />
        </div>
      </div>
    );
  }
}
