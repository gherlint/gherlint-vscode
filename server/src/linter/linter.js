const { replaceCommentsTags, replaceDocString, replaceStory, getLineKeyword } = require('../utils');
const Keywords = require('../keywords');
const { addToDiagnostics } = require('./helper');
const Messages = require('./messages');

module.exports.validateDocument = function (document, docConfig) {
    const diagnostics = [];
    validateFeatureOccurance(document, diagnostics);
    validateStartingStep(document, diagnostics);

    const simpleText = getSimpleText(document);
    validateByLine(document, simpleText, diagnostics);
    return diagnostics;
};

function validateFeatureOccurance(document, diagnostics) {
    const text = document.getText();
    const regex = /(?<!\S( )*)Feature:/g;
    let matchCount = 0;
    while ((match = regex.exec(text))) {
        matchCount++;
        // only show error from second match onward
        if (matchCount > 1) {
            addToDiagnostics(
                document,
                diagnostics,
                match.index,
                match.index + match[0].length,
                Messages.mustHaveOnlyOneFeature,
                'Error'
            );
        }
    }
    if (!matchCount) {
        addToDiagnostics(document, diagnostics, 1, 1, Messages.mustHaveFeatureName, 'Error');
    }
}

function validateStartingStep(document, diagnostics) {
    const text = replaceCommentsTags(document.getText());
    const regex =
        /(?<=(Background:|Scenario( (Outline|Template))?:|Example:)(.*)[\n\r](\s)*)(Given|When|Then|And|But)( )/g;

    while ((match = regex.exec(text))) {
        matchStep = match[0].trim();
        if (![Keywords.Given, Keywords.When].includes(matchStep)) {
            addToDiagnostics(
                document,
                diagnostics,
                match.index,
                match.index + match[0].length - 1,
                Messages.firstStepShouldBeGivenOrWhen
            );
        }
    }
}

function validateByLine(document, text, diagnostics) {
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
            addToDiagnostics(document, diagnostics, index, index + line.length, Messages.invalidLine, 'Error');
            index += lineLength;
            return;
        } else if (!keywordHit && keyword !== Keywords.Feature) {
            addToDiagnostics(
                document,
                diagnostics,
                index,
                index + line.length,
                Messages.mustStartWithFeatureName,
                'Error'
            );
        }
        keywordHit = true;

        const match = regex.exec(line);
        if (Boolean(match)) {
            const matchStep = match[0];
            if (prevStep === matchStep) {
                const rangeEnd = index + match.index + matchStep.length;
                let message = Messages.repeatedStep;
                if (matchStep === Keywords.But) {
                    message = Messages.repeatedStepForBut;
                }
                addToDiagnostics(document, diagnostics, index + match.index, rangeEnd, message);
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
