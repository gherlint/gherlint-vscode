const { DiagnosticSeverity: Severity } = require('vscode-languageserver/node');
const { globalMatch } = require('../../regex');
const Messages = require('../messages');

module.exports = {
    run: function (text) {
        const problems = [];
        const regex = globalMatch.feature;
        let matchCount = 0;

        while ((match = regex.exec(text))) {
            matchCount++;
            // only show error from second match onward
            if (matchCount > 1) {
                problems.push({
                    startIndex: match.index,
                    endIndex: match.index + match[0].length,
                    message: Messages.mustHaveOnlyOneFeature,
                    severity: Severity.Error,
                });
            }
        }
        if (!matchCount) {
            problems.push({
                startIndex: 1,
                endIndex: 1,
                message: Messages.mustHaveFeatureName,
                severity: Severity.Error,
            });
        }

        return problems;
    },
};
