const KEYWORDS = Object.freeze({
    feature: {
        regex: /(.*)Feature:(.*)/g,
        indent: 0,
    },
    scenario: {
        regex: /(.*)(Background|Scenario|Example|Scenario Outline|Scenario Template):(.*)/g,
        indent: 4,
    },
    step: {
        regex: /(.*)(Given|When|Then|And|But|Examples:|Scenarios:)(.*)/g,
        indent: 8,
    },
    table: {
        regex: /(.*)\|(.*)\|[\r\n]{0,1}(.*\|\s){0,}.*\|/g,
        indent: 12,
    },
});

function formatTable(documents, params, result = []) {
    const { textDocument } = params;
    const doc = documents.get(textDocument.uri);
    const text = doc.getText();
    let match;
    while ((match = KEYWORDS.table.regex.exec(text))) {
        const rows = match[0].split('\n');
        const regex = /(?<=\|).*?(?=\|)/g;
        const spaces = [];
        let columns = [];
        let newTable = '';
        rows.forEach((row, rIdx) => {
            const cols = row.match(regex);
            columns[rIdx] = [];

            cols.forEach((col, cIdx) => {
                const colLength = col.trim().length;
                let longestLength = 0;
                if (spaces[cIdx] !== undefined) {
                    longestLength = spaces[cIdx];
                }
                if (colLength > longestLength) {
                    spaces[cIdx] = colLength;
                }
                columns[rIdx][cIdx] = col.trim();
            });
        });
        rows.forEach((row, rIdx) => {
            let newRow = '|';
            columns[rIdx].forEach((column, index) => {
                const extraSpace = ' '.repeat(spaces[index] - column.length);
                newRow += ` ${column}${extraSpace} |`;
            });

            newTable += ' '.repeat(KEYWORDS.table.indent) + newRow.trim() + '\n';
        });
        // remove last new line
        newTable = newTable.trimEnd();
        result.push({
            range: {
                start: doc.positionAt(match.index),
                end: doc.positionAt(match.index + match[0].length),
            },
            newText: newTable,
        });
    }
}

function fixIndentation(documents, params, result = []) {
    const { textDocument } = params;
    const doc = documents.get(textDocument.uri);
    const text = doc.getText();

    Object.keys(KEYWORDS).forEach(function (key) {
        const keyword = KEYWORDS[key];
        if (keyword !== 'table') {
            indentLine(text, keyword, result, doc);
        }
    });
}

function indentLine(text, keyword, result, document) {
    let match;
    const indentWidth = keyword.indent;
    const indent = indentWidth > 0 ? ' '.repeat(indentWidth) : '';
    while ((match = keyword.regex.exec(text))) {
        const formattedLine = indent + match[0].trim();
        result.push({
            range: {
                start: document.positionAt(match.index),
                end: document.positionAt(match.index + match[0].length),
            },
            newText: formattedLine,
        });
    }
}

module.exports.formatDocument = function (documents, params) {
    const result = [];
    formatTable(documents, params, result);
    fixIndentation(documents, params, result);
    return result;
};
