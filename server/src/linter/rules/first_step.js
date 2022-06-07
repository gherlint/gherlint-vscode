const { DiagnosticSeverity: Severity } = require('vscode-languageserver/node');
const { globalMatch } = require('../../regex');
const Keywords = require('../../keywords');
const Messages = require('../messages');

module.exports = {
    run: function (text) {
        const problems = [];
        const regex = globalMatch.beginningStep;

        while ((match = regex.exec(text))) {
            if (![Keywords.Given, Keywords.When].includes(match[0])) {
                problems.push({
                    startIndex: match.index,
                    endIndex: match.index + match[0].length,
                    message: Messages.firstStepShouldBeGivenOrWhen,
                    severity: Severity.Warning,
                });
            }
        }

        return problems;
    },
};
