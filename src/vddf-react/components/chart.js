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

const style = {
  container: {
    margin: '0 auto',
    boxShadow: '0 0 4px 2px rgba(0,0,0,0.1)',
    borderRadius: '2px'
  },
  title: {
    background: '#f2f2f2',
    color: '#448afd',
    padding: '6px 10px',
    position: 'relative'
  },
  menuIcon: {
    color: '#cecece',
    fontSize: 18,
    cursor: 'pointer',
    marginRight: '4px'
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

  async renderChart() {
    const vddf = this.props.vddf;
    const viz = vddf.visualization;

    this.setState({
      adaviz: Immutable.fromJS({
        input: Object.assign(viz, {
          width: this.props.width,
          height: this.props.height
        }),
        data: await AdaVizHelper.aggregateData(vddf)
      })
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
      {title: 'Edit data ...', action: () => this.toggleModal('data')},
      {title: 'Embed ...', action: this.embedChart},
    ];

    if (this.vddf.isModified) {
      menus.splice(3, 0, {
        title: 'Export ...',
        action: this.exportChart
      });
    }

    this.vddf.manager.handle(Handles.UI_TOOLBAR_MENUS, menus, this);

    const menuElements = menus.map((m,i) => (
      <MenuItem key={i} primaryText={m.title} onClick={m.action} />
    ));

    return (
      <div style={{float: 'right'}}>
        <FontIcon style={style.menuIcon} onClick={this.toggleChartSettings} className='material-icons'>equalizer</FontIcon>
        <DropdownMenu>
          {menuElements}
        </DropdownMenu>
      </div>
    );
  }

  getChart() {
    return (
      <AdaVizChart spec={this.state.adaviz} />
    );
  }

  getChartSettings() {
    return (
      <ChartSettings vddf={this.vddf} />
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

  getHeader() {
    return (
      <div className='viz-title' style={style.title}>
        {this.vddf.title || 'Untititled Chart'}
        {this.getToolbar()}
      </div>
    );
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
        {this.getHeader()}
        {this.state.showChartSettings && this.getChartSettings()}
        {this.state.adaviz && this.getChart()}
        {this.getNotificationNotice()}
        {this.getActiveModals()}
      </div>
    );

    return view;
  }
}
