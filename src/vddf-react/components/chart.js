import React from 'react';
import AdaVizChart from './adaviz';
import DropdownMenu from './dropdown-menu';
import DataEditModal from './data-edit-modal';
import ExportModal from './export-modal';
import EditTitleModal from './edit-title-modal';
import ChartSettings from './chart-settings';
import MenuItem from 'material-ui/lib/menus/menu-item';
import FontIcon from 'material-ui/lib/font-icon';
import Immutable from 'immutable';
import AdaVizHelper from '../helpers/adaviz';
import Table from './table';
import Sidebar from './sidebar';

const style = {
  container: {
    margin: '0 auto',
    boxShadow: '0 0 4px 2px rgba(0,0,0,0.1)',
    borderRadius: '4px 4px 0 0',
    background: 'white'
  },
  toolbar: {
    background: '#F1F1F1',
    color: '#448afd',
    padding: '8px 10px',
    position: 'relative',
    borderRadius: '4px 4px 0 0',
    height: 32
  },
  title: {
    fontSize: '16px',
    color: '#4A4A4A',
    height: 50,
    borderBottom: '1px solid #DDDDDD',
    textAlign: 'center',
    paddingTop: '16px'
  },
  titleIcon: {
    color: '#9B9B9B',
    marginRight: '26px',
    cursor: 'pointer'
  },
  menuIcon: {
    color: '#9B9B9B',
    fontSize: 20,
    cursor: 'pointer',
    marginLeft: '16px'
  },
  menuItem: {
    paddingLeft: '16px',
    paddingRight: '16px'
  },
  modificationNotice: {
    background: '#FCFCE0',
    fontSize: '0.85em',
    padding: '4px 8px'
  },
  noticeLink: {
    color: 'rgb(29, 170, 241)',
    cursor: 'pointer'
  }
};

export const Handles = {
  UI_TOOLBAR_BUTTONS: 'ui-toolbar-buttons',
  UI_TOOLBAR_MENUS: 'ui-toolbar-menus',
  UI_ACTIVATE_MODAL: 'ui-activate-modal'
};

export default class Chart extends React.Component {
  static defaultProps = {
    width: 750,
    height: 500
  };

  static childContextTypes = {
    baseUrl: React.PropTypes.string
  };

  constructor(props) {
    super(props);

    this.state = {
      adaviz: null,
      modal: {},
      showChartSettings: false,
      embedResult: null
    };
  }

  getChildContext() {
    return {
      baseUrl: `${this.props.baseUrl}/`
    };
  }

  get vddf() {
    return this.props.vddf;
  }

  componentDidMount() {
    this.renderChart();
    this.vddf.on('update', this.handleUpdate);
  }

  componentWillUnmount() {
    this.vddf.off('update', this.handleUpdate);
  }

  getCanvasHeight() {
    let height = this.props.height - 32 - 50; // header + title

    if (this.vddf.isModified()) {
      height -= 22; // footer modification notice
    }

    return height;
  }

  async renderChart() {
    const vddf = this.props.vddf;
    const viz = vddf.visualization;
    let height = this.getCanvasHeight();
    let width = this.props.width;

    if (this.state.showChartSettings) {
      width -= 185;
      height -= 80;
    }

    if (viz.type !== 'datatable') {
      width = Math.min(800, width);
    }

    const spec = Immutable.fromJS({
      input: {
          ...viz,
        width,
        height
      },
      data: await AdaVizHelper.aggregateData(vddf)
    });

    this.setState({
      adaviz: spec
    });
  }

  getModal(name) {
    switch (name) {
    case 'data':
      return <DataEditModal vddf={this.vddf} onRequestClose={() => this.toggleModal('data')} onSave={this.saveData} />;
    case 'title':
      return <EditTitleModal title={this.vddf.title} onSave={this.saveTitle} onRequestClose={() => this.toggleModal('title')} />;
    case 'export':
      return <ExportModal embed={this.state.embedResult} onRequestClose={() => this.toggleModal('export')} />;
    default:
      return this.vddf.manager.handle(Handles.UI_ACTIVATE_MODAL, name, this);
    }
  }

  toggleModal = (name) => {
    let modal = this.state.modal;

    if (modal[name]) {
      delete modal[name];
    } else {
      modal[name] = this.getModal(name);
    }

    this.setState({modal: modal});
  };

  handleUpdate = () => {
    this.renderChart();
  };

  getActiveModals = () => {
    for (let name in this.state.modal) {
      return this.state.modal[name];
    }
  };

  toggleChartSettings = () => {
    this.setState({
      showChartSettings: !this.state.showChartSettings
    });

    // TODO: optimize this by recalculate the height
    setTimeout(() => {
      this.renderChart();
    }, 80);
  };

  saveData = (data, schema) => {
    this.vddf.updateData(data, schema);
    this.toggleModal('data');
  };

  saveTitle = (title) => {
    this.vddf.title = title;
    this.toggleModal('title');
  };

  exportChart = () => {
    this.vddf.manager.export(this.vddf)
      .then(result => {
        this.setState({
          embedResult: result
        });

        this.toggleModal('export');
      });
  };

  embedChart = () => {
    if (!this.vddf.uuid) {
      this.exportChart();
    } else {
      this.vddf.manager.embed(this.vddf)
        .then(result => {
          this.setState({
            embedResult: result
          });

          this.toggleModal('export');
        });
    }
  };

  revertChange = () => {
    this.vddf.revert();
  };

  getToolbar() {
    // TODO: cache menus
    const menus = [
      {title: 'Edit title ...', action: () => this.toggleModal('title')},
      {title: 'Embed ...', action: this.embedChart},
    ];

    if (this.vddf.isModified) {
      menus.splice(3, 0, {
        title: 'Export ...',
        action: this.exportChart
      });
    }

    // TODO: google spreadsheet ?
    const toolbarButtons = [
      {icon: 'mdi-table-edit', action: () => this.toggleModal('data')}
    ];

    // extension point
    this.vddf.manager.handle(Handles.UI_TOOLBAR_MENUS, menus, this);
    this.vddf.manager.handle(Handles.UI_TOOLBAR_BUTTONS, toolbarButtons, this);

    const menuElements = menus.map((m,i) => (
      <MenuItem key={i} primaryText={m.title} onClick={m.action} />
    ));

    const buttonElements = toolbarButtons.map((b,i) => {
      return <FontIcon key={i} style={style.menuIcon} onClick={b.action} className={'mdi ' + b.icon} />;
    });

    return (
      <div className='viz-toolbar' style={style.toolbar}>
        <div style={{float: 'right'}}>
          {buttonElements}
          <DropdownMenu iconStyle={style.menuIcon} icon='mdi-share-variant'>
            {menuElements}
          </DropdownMenu>
        </div>
      </div>
    );
  }

  getTitle() {
    const chartType = this.vddf.chartType;
    const icons = [
      { icon: 'mdi-table', action: this.switchToTable, active: chartType === 'datatable' },
      { icon: 'mdi-chart-bar', action: this.switchToChart, active: chartType !== 'datatable' }
    ];

    const titleIcons = icons.map((i,k) => {
      return <FontIcon key={k} color={i.active ? '#F99400' : null} style={style.titleIcon} className={`mdi ${i.icon}`} onClick={i.action} />;
    });

    return (
      <div className='vddf-chart-title' style={style.title}>
        <div style={{position: 'absolute', marginLeft: 18}}>
          {titleIcons}
        </div>
        {this.vddf.title}
      </div>
    );
  }

  switchToChart = () => {
    if (this.vddf.chartType === 'datatable') {
      this.setState({
        showChartSettings: true
      });

      this.vddf.chartType = this.vddf.visualization.previousType || this.vddf.getAvailableCharts()[0];
    } else {
      this.toggleChartSettings();
    }
  };

  switchToTable = () => {
    // hide chart settings if necessary
    if (this.state.showChartSettings)
      this.toggleChartSettings();

    // also force to table
    this.vddf.chartType = 'datatable';
  };

  getChart() {
    try {
      const input = this.state.adaviz.get('input').toJS();
      const wrapperStyle = {width: this.props.width, overflow: 'hidden'};
      let el;

      if (input.type === 'datatable') {
        // use directly vddf payload to speed up the renderer
        const data = this.vddf.payload.get('data');
        const schema = this.vddf.payload.get('schema');

        el = (
          <div style={{overflow: 'auto', margin: '0 auto', paddingRight: '8px', width: input.width - 16, height: input.height}}>
            <Table data={data} schema={schema} width={input.width} height={input.height} />
          </div>
        );
      } else {
        el = (
          <div style={{width: input.width, height: input.height, margin: '0 auto'}}>
            <AdaVizChart spec={this.state.adaviz} />
          </div>
        );
      }

      if (this.state.showChartSettings) {
        wrapperStyle.width -= 185;
        wrapperStyle.marginLeft = 185;
      }

      return (
        <div style={wrapperStyle}>
          {this.state.showChartSettings ? <ChartSettings key={1} vddf={this.vddf} /> : null}
          {el}
        </div>
      );
    } catch (ex) { }
  }

  getChartSettings() {
    return (
      <Sidebar vddf={this.vddf} height={this.getCanvasHeight()}></Sidebar>
    );
  }

  getNotificationNotice() {
    if (this.vddf.isModified()) {
      return (
        <div style={style.modificationNotice}>
          You have customized this visualization. <span style={style.noticeLink} onClick={this.revertChange}>Revert</span> or <span onClick={this.exportChart} style={style.noticeLink}>Export</span>.
        </div>
      );
    }
  }

  render() {
    if (this.props.mode === 'chartonly') {
      return (
        <div>
          {this.state.adaviz && this.getChart()}
        </div>
      );
    }

    const view = (
      <div style={{...style.container, width: this.props.width}}>
        {this.getToolbar()}
        {this.getTitle()}
        <div style={{overflow: 'hidden', height: this.getCanvasHeight()}}>
          {this.state.showChartSettings && this.getChartSettings()}
          {this.state.adaviz && this.getChart()}
        </div>
        {this.getNotificationNotice()}
        {this.getActiveModals()}
      </div>
    );

    return view;
  }
}
