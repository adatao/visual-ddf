import React from 'react';

const style = {
  container: {
    overflow: 'auto',
    margin: '0 auto',
    padding: '0 0 8px 0'
  },

  table: {
    borderCollapse: 'collapse',
    border: 0,
    width: '100%'
  },

  thead: {
  },

  th: {
    margin: 0,
    borderTop: 0,
    borderLeft: 0,
    borderRight: 0,
    borderBottom: '1px solid #DDDDDD',
    textAlign: 'left',
    fontSize: '14px',
    color: '#4A4A4A',
    padding: '7px 16px'
  },

  td: {
    color: '#4A4A4A',
    padding: '7px 16px',
    margin: 0,
    whiteSpace: 'nowrap',
    textAlign: 'left',
    fontSize: '14px',
    border: '0'
  },

  even: {
    background: '#FAFAFA'
  }
};

export default class Table extends React.Component {

  shouldComponentUpdate(nextProps) {
    const toUpdate = nextProps.data !== this.props.data && this.props.schema !== this.props.schema;

    return toUpdate;
  }

  render() {
    const data = this.props.data.toJS();
    const schema = this.props.schema.toJS();
    const head = schema.map((c,i) => {
      return <th key={i} style={style.th}>{c.name}</th>;
    });

    const body = data.map((c,j) => {
      const tds = c.map((v,i) => {
        let tdStyle = {...style.td};

        if (j % 2 == 0) {
          tdStyle = Object.assign(tdStyle, style.even);
        }

        return <td style={tdStyle} key={i}>{v ? v + '' : ''}</td>;
      });

      return <tr key={j}>{tds}</tr>;
    });

    return (
      <div>
        <div style={{paddingRight: 16}}>
        <table className='vddf-table' style={style.table}>
          <thead><tr style={style.thead}>{head}</tr></thead>
          <tbody>{body}</tbody>
        </table>
        </div>
      </div>
    );
  }
}
