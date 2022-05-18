const { firstMatch } = require('../../regex');
const Keywords = require('../../keywords');
const Messages = require('../messages');
const { addToDiagnostics } = require('../helper');
const { replaceCommentsTags } = require('../../utils');

function isStepKeyword(keyword) {
    return [Keywords.Given, Keywords.When, Keywords.Then, Keywords.But, Keywords.And].includes(keyword);
}

function isScenarioKeyword(keyword) {
    return [
        Keywords.Background,
        Keywords.Scenario,
        Keywords.Example,
        Keywords['Scenario Template'],
        Keywords['Scenario Outline'],
    ].includes(keyword);
}

module.exports = {
    run: function (document, text, diagnostics) {
        const sanitizedText = replaceCommentsTags(text);
        const lines = sanitizedText.split('\n');
        const regex = firstMatch.keyword;

        let prevStep = '';
        let position = 0;
        let enteredScenario = false;

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
                position += lineLength;
                return;
            }

            const match = regex.exec(line);
            if (Boolean(match)) {
                const keyword = match[0];
                if (isStepKeyword(keyword)) {
                    enteredScenario = true;
                    if (prevStep === keyword) {
                        if (keyword !== Keywords.And) {
                            const rangeEnd = position + match.index + keyword.length;
                            let message = Messages.repeatedStep;
                            if (keyword === Keywords.Then) {
                                message = Messages.repeatedStepForThen;
                            }
                            addToDiagnostics(document, diagnostics, position + match.index, rangeEnd, message);
                        }
                    }
                    prevStep = keyword;
                } else if (enteredScenario && isScenarioKeyword(keyword)) {
                    prevStep = '';
                    enteredScenario = false;
                }
            }
            position += lineLength;
        });
    },
};
