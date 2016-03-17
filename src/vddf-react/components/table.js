import React from 'react';

const style = {
  container: {
    overflow: 'auto',
    margin: '0 auto',
    padding: '8px 0'
  },

  table: {
    borderCollapse: 'collapse',
    width: '100%'
  },

  thead: {
  },

  th: {
    margin: 0,
    borderTop: '1px solid #DDDDDD',
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
    fontSize: '14px'
  },

  even: {
    background: '#FAFAFA'
  }
};

export default class Table extends React.Component {
  render() {
    const spec = this.props.spec.toJS();
    const { width, height } = spec.input;
    const schema = Object.keys(spec.data[0]).sort();
    const head = schema.map((c,i) => {
      return <th key={i} style={style.th}>{c}</th>;
    });

    const body = spec.data.map((c,j) => {
      const tds = schema.map((k,i) => {
        let tdStyle = {...style.td};

        if (j % 2 == 0) {
          tdStyle = Object.assign(tdStyle, style.even);
        }

        return <td style={tdStyle} key={i}>{c[k] ? c[k] + '' : ''}</td>;
      });

      return <tr key={j}>{tds}</tr>;
    });

    return (
      <div style={{...style.container, width: width-16, height}}>
        <div style={{paddingRight: 16}}>
        <table style={style.table}>
          <thead><tr style={style.thead}>{head}</tr></thead>
          <tbody>{body}</tbody>
        </table>
        </div>
      </div>
    );
  }
}
