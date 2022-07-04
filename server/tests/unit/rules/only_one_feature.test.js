const assert = require('assert');
const { DiagnosticSeverity: Severity } = require('vscode-languageserver/node');
const Messages = require('../../../src/linter/messages');
const Rule = require('../../../src/linter/rules/only_one_feature');

const testCases = [
    // [<test description>, <text content>, <expected>]
    ['Feature: - Feature:', 'Feature: Feature name\nFeature:', [buildLintInfo(22, 30)]],
    ['Feature: - Feature Description', 'Feature: Feature name\n    Feature Description', []],
    ['Feature: - feature: Description', 'Feature: Feature name\n    feature: Description', []],
    ['Feature: - Feature: Description', 'Feature: Feature name\n    Feature: Description', [buildLintInfo(25, 34)]],
    ['Tag - Feature:', '@tag\nFeature: Feature name', []],
    ['MultipleTags - Feature:', '@tag1\n@tag2 @tag3 @tag4\nFeature: Feature name', []],
    ['Feature: - Background: - Feature:', 'Feature: Feature name\n        Feature Description\n\n    Background: Background name\n    Given a step\n\nFeature:\n', [buildLintInfo(101, 109)]],
    ['Feature: - Scenario: - Feature:', 'Feature: Feature name\n        Feature Description\n\n    Scenario: Scenario name\n    Given a step\n\nFeature:\n', [buildLintInfo(97, 105)]],
    ['Feature: - Scenario Outline: - Feature:', 'Feature: Feature name\n        Feature Description\n\n    Scenario Outline: Scenario Outline name\n\nFeature:\n', [buildLintInfo(96, 104)]],
    ['Feature: - Background: - Scenario: - Scenario Outline: - Feature:', 'Feature: Feature name\n    Feature Description\n    Background: Background name\n     Scenario: Scenario name\n    Scenario Outline: Scenario Outline name \nFeature:\n', [buildLintInfo(152, 160)]],
    ['Feature: - Feature: as text', 'Feature: Feature name\n    This is Feature: description\n', []],
    ['Comment with Feature: - Feature:', '# comment Feature: section\nFeature: Feature name\n', []],
    ['Multiple Feature: - Feature: as text', 'Feature: Feature 1 Description\nFeature: Feature 2 Description\nFeature: Feature 3 Description\n    This is a Feature: description\n', [buildLintInfo(31, 39),buildLintInfo(62, 70)]],
    ['Multiple Feature: - Multiple Feature: as text', '# There should be only one Feature: keyword \nFeature: Feature 1 Description\nFeature: Feature 2 Description\nFeature: Feature 3 Description\n    This is a Feature: description1\n    This is a Feature: description2\n', [buildLintInfo(76, 84),buildLintInfo(107, 115)]],
    ['Feature: - Whitespace Feature: - Feature: as text', 'Feature: Feature 1 Description\n    Feature: Feature 2 Description\n    This is a Feature: description\n', [buildLintInfo(34, 43)]],
];

describe('Rule: Feature file must have only one feature keyword ', function () {
    test.each(testCases)('%s', function (_, content, expected) {
        const problems = Rule.run(content);
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