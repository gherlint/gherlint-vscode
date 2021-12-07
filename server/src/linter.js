const { DiagnosticSeverity } = require('vscode-languageserver/node');

module.exports.validateSteps = async function (document) {
    let text = document.getText();
    const lines = text.split('\n');
    const regex = /[GWTAB]{1}[ivenhdut]{2,4}\s/;

    let diagnostics = [];
    let prevStep = '';
    let index = 0;
    lines.forEach((line) => {
        let lineLength = line.length;
        if (lineLength === 0) {
            lineLength = 1;
        } else {
            // also count line break
            lineLength += 1;
        }
        const match = regex.exec(line);
        if (Boolean(match)) {
            const matchStep = match[0].trim();
            if (prevStep === matchStep) {
                const rangeEnd = index + match.index + matchStep.length;
                let diagnostic = {
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: document.positionAt(index + match.index),
                        end: document.positionAt(rangeEnd),
                    },
                    message: `Replace '${matchStep}' with 'And'`,
                };
                diagnostics.push(diagnostic);
            }
            if (matchStep !== 'And') {
                prevStep = matchStep;
            }
        } else {
            prevStep = '';
            // send invalid step error
        }
        index += lineLength;
    });
    return diagnostics;
};
