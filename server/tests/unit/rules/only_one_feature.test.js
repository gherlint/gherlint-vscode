const assert = require('assert');
const { DiagnosticSeverity: Severity } = require('vscode-languageserver/node');
const Messages = require('../../../src/linter/messages');
const Rule = require('../../../src/linter/rules/only_one_feature');

const testCases = [
    // [<test description>, <text content>, <expected>]
    ['Feature: - Feature:', 'Feature: Feature name\nFeature:', [buildLintInfo(22, 30)]],
    ['Feature: - Feature Description', 'Feature: Feature name\n    Feature Description', []],
    ['Feature: - feature: Description', 'Feature: Feature name\n    feature: Description', []],
    ['Feature: - Feature: Description', 'Feature: Feature name\n    Feature: Description', [buildLintInfo(26, 34)]],
    ['Tag - Feature:', '@tag\nFeature: Feature name', []],
    ['MultipleTags - Feature:', '@tag1\n@tag2 @tag3 @tag4\nFeature: Feature name', []],
    ['Feature: - Background: - Feature:', 'Feature: Feature name\n        Feature Description\n\n    Background: Background name\n    Given a step\n\nFeature:\n', [buildLintInfo(101, 109)]],
    ['Feature: - Scenario: - Feature:', 'Feature: Feature name\n        Feature Description\n\n    Scenario: Scenario name\n    Given a step\n\nFeature:\n', [buildLintInfo(97, 105)]],
    ['Feature: - Scenario Outline: - Feature:', 'Feature: Feature name\n        Feature Description\n\n    Scenario Outline: Scenario Outline name\n\nFeature:\n', [buildLintInfo(96, 104)]],
    ['Feature: - Background: - Scenario: - Scenario Outline: - Feature:', 'Feature: Feature name\n    Feature Description\n    Background: Background name\n     Scenario: Scenario name\n    Scenario Outline: Scenario Outline name \nFeature:\n', [buildLintInfo(152, 160)]],

];

describe('Rule: Feature file must have only one feature keyword ', function () {
    test.each(testCases)('%s', function (_, content, expected) {
        const problems = Rule.run(content);
        assert.deepEqual(problems, expected);
    });
});

// This test needs to be passed but is failing while linting
// This test case can be added to above testscases after the following issue has been solved
// https://github.com/gherlint/gherlint-vscode/issues/16
describe('Tests expected to pass but failing ', function () {
    test.failing('Feature: as a text but not keyword', () => {
        const problems = Rule.run('Feature: Feature name\n    This Feature: is not a keyword');
        const expected = []
        assert.deepEqual(problems, expected);
    });
});

function buildLintInfo(startIndex, endIndex) {
    return {
        startIndex,
        endIndex,
        message: Messages.mustHaveOnlyOneFeature,
        severity: Severity.Error,
    };
}