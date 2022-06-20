const { TextDocument } = require('vscode-languageserver-textdocument');

module.exports = {
    newDocument: function (content) {
        return TextDocument.create('file://features/test.feature', 'gherkin', 0, content);
    },
};
