const { DiagnosticSeverity } = require('vscode-languageserver/node');
const { replaceCommentsTags, replaceDocString, replaceStory, getLineKeyword } = require('./utils');
const defaultSettings = require('./defaultSettings');
const Keywords = require('./keywords');

module.exports.validateDocument = function (document, docConfig) {
    const diagnostics = [];
    validateFeature(document, diagnostics);
    validateBeginningStep(document, diagnostics, docConfig);

    const simpleText = getSimpleText(document);
    checkRepeatedSteps(document, simpleText, diagnostics);
    return diagnostics;
};

function validateFeature(document, diagnostics) {
    const text = document.getText();
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
                message: `There must be only one "${Keywords.Feature}" keyword in a file.`,
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
    const text = replaceCommentsTags(document.getText());
    const regex =
        /(?<=(Background:|Scenario( (Outline|Template))?:|Example:)(.*)[\n\r](\s)*)(Given|When|Then|And|But)( )/g;

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
                    end: document.positionAt(match.index + match[0].length - 1),
                },
                message: `Starting step must be "${Keywords.Given}" or "${Keywords.When}" step`,
            });
        }
    }
}

function checkRepeatedSteps(document, text, diagnostics) {
    const lines = text.split('\n');
    const regex = /(Given|When|Then|And|But)/;

    let prevStep = '';
    let index = 0;
    let keywordHit = false;
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

        const keyword = getLineKeyword(line);
        if (!keyword) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: document.positionAt(index),
                    end: document.positionAt(index + line.length),
                },
                message: 'Invalid line',
            });

            index += lineLength;
            return;
        } else if (!keywordHit && keyword !== Keywords.Feature) {
            diagnostics.push({
                severity: DiagnosticSeverity.Error,
                range: {
                    start: document.positionAt(index),
                    end: document.positionAt(index + line.length),
                },
                message: 'A valid feature file must start with a Feature name.\nE.g., Feature: Login feature',
            });
        }
        keywordHit = true;

        const match = regex.exec(line);
        if (Boolean(match)) {
            const matchStep = match[0];
            if (prevStep === matchStep) {
                const rangeEnd = index + match.index + matchStep.length;
                let message = `Replace "${matchStep}" with "${Keywords.And}"`;
                if (matchStep !== Keywords.But) {
                    message += ` or "${Keywords.But}"`;
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
            if (matchStep !== Keywords.And) {
                prevStep = matchStep;
            }
        } else {
            prevStep = '';
        }
        index += lineLength;
    });
}

// return text where tags, comments, user story and docstring are replaced with space
function getSimpleText(document) {
    let text = replaceCommentsTags(document.getText());
    text = replaceDocString(text);
    text = replaceStory(text);
    return text;
}
