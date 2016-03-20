import React from 'react';
import AceEditor from 'react-ace';

export default class CustomAceEditor extends AceEditor {
  static contextTypes = {
    storage: React.PropTypes.object
  };

  componentDidMount() {
    super.componentDidMount();

    const editor = this.editor;

    editor.renderer.lineHeight = 28;
    editor.setOptions({
      enableBasicAutocompletion: true
    });
    editor.completers = [{
      getCompletions: this.autocomplete.bind(this)
    }];

    this.context.storage.list()
      .then((r) => {
        this.setState({
          tables: r.map(t => t.name)
        });
      });
  }

  autocomplete(editor, session, pos, prefix, callback) {
    // TODO: add table name here
    callback(null, (this.state.tables || []).map(function(word) {
      return {
        caption: word,
        value: word
      };
    }));
  }
}
