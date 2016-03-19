import AceEditor from 'react-ace';

export default class CustomAceEditor extends AceEditor {
  componentDidMount() {
    super.componentDidMount();

    const editor = this.editor;

    editor.renderer.lineHeight = 28;
  }
}
