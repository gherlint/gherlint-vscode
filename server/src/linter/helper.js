/**
 *
 * @param {*} document
 * @param {array} diagnostics
 * @param {number} rangeStart
 * @param {number} rangeEnd
 * @param {string} message
 * @param {number} severity Error=1, Warning=2, Information=3, Hint=4
 * @returns
 */
function addToDiagnostics(document, diagnostics, rangeStart, rangeEnd, message, severity = 2) {
    return diagnostics.push({
        severity,
        range: {
            start: document.positionAt(rangeStart),
            end: document.positionAt(rangeEnd),
        },
        message,
    });
}

module.exports = {
    addToDiagnostics,
};
