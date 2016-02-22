import { Handles } from '../components/chart';

export default class DownloadCsvHandler {
  register(manager) {
    manager.addHandle(Handles.UI_TOOLBAR_MENUS, this.addMenu.bind(this));
  }

  addMenu(menus, vddf) {
    menus.push({
      title: 'Download as CSV',
      action: () => this.downloadChart(vddf)
    });
  }

  downloadChart(vddf) {
    this.getDownloadLink(vddf)
      .then(downloadLink => {
        let link = document.createElement('a');
        link.download = `${vddf.title}.csv`;
        link.href = downloadLink;
        link.click();
      });
  };

  async getDownloadLink(vddf) {
    let csv = '';

    // header
    csv += vddf.schema.map(field => `\"${field.name}\"`).join(',') + '\n';

    vddf.fetch().forEach(row => {
      csv += row.map(field => `\"${field}\"`).join(',') + '\n';
    });

    return `data:application/csv;charset=utf-8,` + encodeURIComponent(csv);
  }
}
