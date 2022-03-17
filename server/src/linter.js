const { DiagnosticSeverity } = require('vscode-languageserver/node');

const keywordsRegex =
    /(Feature:|Rule:|Background:|Scenario( (Outline|Template))?:|Given|When|Then|And|But|Example(s)?:|Scenarios:)/;

const stepKeywords = ['Given', 'When', 'Then', 'And', 'But'];
const exampleKeywords = ['Background', 'Scenario', 'Example', 'Scenario Outline', 'Scenario Template'];

module.exports.validateDocument = function (document, docConfig) {
    const diagnostics = [];
    diagnostics.push(...checkBeginningStep(document, diagnostics));
    diagnostics.push(...checkRepeatedSteps(document, diagnostics));
    return diagnostics;
};

function checkBeginningStep(document, diagnostics) {
    let text = document.getText();
    const regex = /(Background:|Scenario( (Outline|Template))?:|Example:)/;
    let noOfIssue = 0;
    while ((match = regex.exec(text)) && noOfIssue < docConfig.maxNumberOfProblems) {
        noOfIssue++;
        diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: {
                start: document.positionAt(match.index),
                end: document.positionAt(match.index + match[0].length),
            },
            message: `Starting step must be "Given" or "When" step`,
        });
    }
    return diagnostics;
}

function checkRepeatedSteps(document, diagnostics) {
    let text = document.getText();
    const lines = text.split('\n');
    const regex = /[GWTAB]{1}[ivenhdut]{2,4}/;

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
            const matchStep = match[0].trim().trim(':');
            if (prevStep === matchStep) {
                const rangeEnd = index + match.index + matchStep.length;
                let diagnostic = {
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: document.positionAt(index + match.index),
                        end: document.positionAt(rangeEnd),
                    },
                    message: `Replace '${matchStep}' with 'And' or 'But'`,
                };
                diagnostics.push(diagnostic);
            }
            if (matchStep !== 'And') {
                prevStep = matchStep;
            }
            if (!stepKeywords.includes(matchStep)) {
                prevStep = '';
            }
        }
        index += lineLength;
    });
    return diagnostics;
}
