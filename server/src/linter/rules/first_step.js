const { globalMatch } = require('../../regex');
const Keywords = require('../../keywords');
const Messages = require('../messages');
const { addToDiagnostics } = require('../helper');

module.exports = {
    run: function (document, text, diagnostics) {
        const regex = globalMatch.beginningStep;

        while ((match = regex.exec(text))) {
            if (![Keywords.Given, Keywords.When].includes(match[0])) {
                addToDiagnostics(
                    document,
                    diagnostics,
                    match.index,
                    match.index + match[0].length,
                    Messages.firstStepShouldBeGivenOrWhen
                );
            }
        }
    },
};
