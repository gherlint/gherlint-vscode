const rules = require('./rules');

module.exports.lint = function (document, docConfig) {
    const diagnostics = [];
    const text = document.getText();
    Object.keys(rules).forEach(function (ruleId) {
        rules[ruleId].run(document, text, diagnostics);
    });
    return diagnostics;
};
