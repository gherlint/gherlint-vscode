const rules = require('./rules');
const { addToDiagnostics } = require('./helper');

module.exports.lint = function (document, docConfig) {
    const diagnostics = [];
    const text = document.getText();
    Object.keys(rules).forEach(function (ruleId) {
        const problems = rules[ruleId].run(text);

        problems.forEach(function ({ startIndex, endIndex, message, severity }) {
            addToDiagnostics(document, diagnostics, startIndex, endIndex, message, severity);
        });
    });
    return diagnostics;
};
