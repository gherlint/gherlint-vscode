const { DiagnosticSeverity: Severity } = require('vscode-languageserver/node');
const { globalMatch } = require('../../regex');
const Messages = require('../messages');
const { addToDiagnostics } = require('../helper');

module.exports = {
    run: function (document, text, diagnostics) {
        const regex = globalMatch.feature;
        let matchCount = 0;

        while ((match = regex.exec(text))) {
            matchCount++;
            // only show error from second match onward
            if (matchCount > 1) {
                addToDiagnostics(
                    document,
                    diagnostics,
                    match.index,
                    match.index + match[0].length,
                    Messages.mustHaveOnlyOneFeature,
                    Severity.Error
                );
            }
        }
        if (!matchCount) {
            addToDiagnostics(document, diagnostics, 1, 1, Messages.mustHaveFeatureName, Severity.Error);
        }
    },
};
