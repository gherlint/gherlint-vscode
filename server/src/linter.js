const { DiagnosticSeverity } = require('vscode-languageserver/node');
const { removeCommentsTags } = require('./utils');
const defaultSettings = require('./defaultSettings');
const Keywords = require('./keywords');

const stepKeywords = ['Given', 'When', 'Then', 'And', 'But'];
const exampleKeywords = ['Background', 'Scenario', 'Example', 'Scenario Outline', 'Scenario Template'];

module.exports.validateDocument = function (document, docConfig) {
    const diagnostics = [];
    validateFeature(document, diagnostics);
    validateBeginningStep(document, diagnostics, docConfig);
    checkRepeatedSteps(document, diagnostics);
    return diagnostics;
};

function validateFeature(document, diagnostics) {
    let text = document.getText();
    const regex = /(?<!\S( )*)Feature:/g;
    let matchCount = 0;
    while ((match = regex.exec(text))) {
        matchCount++;
        // only show error from second match onward
        if (matchCount > 1) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: document.positionAt(match.index),
                    end: document.positionAt(match.index + match[0].length),
                },
                message: 'There must be only one "Feature" keyword in a file.',
            });
        }
    }
    if (!matchCount) {
        diagnostics.push({
            severity: DiagnosticSeverity.Error,
            range: {
                start: document.positionAt(1),
                end: document.positionAt(1),
            },
            message: 'A valid feature file must have a Feature name.\nE.g., Feature: Login feature',
        });
    }
}

function validateBeginningStep(document, diagnostics, docConfig) {
    let text = removeCommentsTags(document.getText());
    const regex =
        /(?<=(Background:|Scenario( (Outline|Template))?:|Example:)(.*)[\n\r](\s)*)[GWTAB]{1}[ivenhdut]{2,4}/g;

    let noOfProblem = 0;
    const maxNumberOfProblems = docConfig.maxNumberOfProblems || defaultSettings.maxNumberOfProblems;
    while ((match = regex.exec(text)) && noOfProblem < maxNumberOfProblems) {
        noOfProblem++;
        matchStep = match[0].trim();
        if (!['Given', 'When'].includes(matchStep)) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: {
                    start: document.positionAt(match.index),
                    end: document.positionAt(match.index + match[0].length),
                },
                message: 'Starting step must be "Given" or "When" step',
            });
        }
    }
}

function checkRepeatedSteps(document, diagnostics) {
    let text = removeCommentsTags(document.getText());
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

        // do not process empty line
        if (!line.trim().length) {
            index += lineLength;
            return;
        }
        const match = regex.exec(line);
        if (Boolean(match)) {
            const matchStep = match[0].trim().trim(':');
            if (prevStep === matchStep) {
                const rangeEnd = index + match.index + matchStep.length;
                let message = `Replace "${matchStep}" with "And"`;
                if (matchStep !== 'But') {
                    message += ' or "But"';
                }
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: {
                        start: document.positionAt(index + match.index),
                        end: document.positionAt(rangeEnd),
                    },
                    message,
                });
            }
            if (matchStep !== 'And') {
                prevStep = matchStep;
            }
            if (!stepKeywords.includes(matchStep)) {
                prevStep = '';
            }
        } else {
            console.log(line);
        }
        index += lineLength;
    });
}

function isUnknownLine(line) {}
