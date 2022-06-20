const assert = require('assert');
const { DiagnosticSeverity: Severity } = require('vscode-languageserver/node');
const Messages = require('../../../src/linter/messages');
const Rule = require('../../../src/linter/rules/first_step');

const testCases = [
    // [<test description>, <text content>, <expected>]
    ['Background - Then', 'Background: description\n    Then a step', [buildLintInfo(28, 32)]],
    ['Background - And', 'Background: description\n  And a step', [buildLintInfo(26, 29)]],
    ['Background - But', 'Background: description\n But a step', [buildLintInfo(25, 28)]],
    ['Scenario - Then', 'Scenario: description\nThen a step', [buildLintInfo(22, 26)]],
    ['Scenario - And', 'Scenario: description\nAnd a step', [buildLintInfo(22, 25)]],
    ['Scenario - But', 'Scenario: description\nBut a step', [buildLintInfo(22, 25)]],
    ['Example - Then', 'Example: description\nThen a step', [buildLintInfo(21, 25)]],
    ['Example - And', 'Example: description\nAnd a step', [buildLintInfo(21, 24)]],
    ['Example - But', 'Example: description\nBut a step', [buildLintInfo(21, 24)]],
    ['Scenario Outline - Then', 'Scenario Outline: description\nThen a step', [buildLintInfo(30, 34)]],
    ['Scenario Outline - And', 'Scenario Outline: description\nAnd a step', [buildLintInfo(30, 33)]],
    ['Scenario Outline - But', 'Scenario Outline: description\nBut a step', [buildLintInfo(30, 33)]],
    ['Scenario Template - Then', 'Scenario Template: description\nThen a step', [buildLintInfo(31, 35)]],
    ['Scenario Template - And', 'Scenario Template: description\nAnd a step', [buildLintInfo(31, 34)]],
    ['Scenario Template - But', 'Scenario Template: description\nBut a step', [buildLintInfo(31, 34)]],
    ['Scenario - Then - Given', 'Scenario: description\nThen a step\nGiven again a step', [buildLintInfo(22, 26)]],
    ['Scenario - Given', 'Scenario: description\nGiven a step', []],
    ['Scenario - When', 'Scenario: description\nWhen a step', []],
];

describe('Rule: first_step', function () {
    test.each(testCases)('%s', function (_, content, expected) {
        const problems = Rule.run(content);

        assert.deepEqual(problems, expected);
    });
});

function buildLintInfo(startIndex, endIndex) {
    return {
        startIndex,
        endIndex,
        message: Messages.firstStepShouldBeGivenOrWhen,
        severity: Severity.Warning,
    };
}
