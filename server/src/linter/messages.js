const Keywords = require('../keywords');

module.exports = {
    mustHaveOnlyOneFeature: `There must be only one "${Keywords.Feature}" keyword in a file.`,
    mustHaveFeatureName: 'A valid feature file must have a Feature name.\nE.g., Feature: Login feature',
    mustStartWithFeatureName: 'A valid feature file must start with a Feature name.\nE.g., Feature: Login feature',
    firstStepShouldBeGivenOrWhen: `Starting step must be "${Keywords.Given}" or "${Keywords.When}" step`,
    invalidLine: 'Invalid line',
    repeatedStep: `Replace with "${Keywords.And}"`,
    repeatedStepForThen: `Replace with "${Keywords.And}" or "${Keywords.But}"`,
};
