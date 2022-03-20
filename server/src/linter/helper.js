const { DiagnosticSeverity } = require('vscode-languageserver/node');

function addToDiagnostics(document, diagnostics, rangeStart, rangeEnd, message, severity = 'Warning') {
    severity = severity.charAt(0).toUpperCase() + severity.slice(1);

    return diagnostics.push({
        severity: DiagnosticSeverity[severity],
        range: {
            start: document.positionAt(rangeStart),
            end: document.positionAt(rangeEnd),
        },
        message,
    });
}

module.exports = {
    addToDiagnostics,
};
