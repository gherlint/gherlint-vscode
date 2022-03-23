const { globalMatch, firstMatch } = require('./regex');

function replaceCommentsTags(text) {
    const lines = text.split('\n');
    let newText = [];
    lines.forEach((line) => {
        if (!line.trim().length || line.trim().startsWith('#') || line.trim().startsWith('@')) {
            newText.push(' '.repeat(line.length));
        } else {
            newText.push(line);
        }
    });
    return newText.join('\n');
}

function replaceDocString(text) {
    const regex = globalMatch.docString;
    while ((match = regex.exec(text))) {
        const hiddenDocString = match[0].replace(/\S/g, ' ');
        text = text.substring(0, match.index) + hiddenDocString + text.substring(match.index + hiddenDocString.length);
    }
    return text;
}

function replaceStory(text) {
    const regex = firstMatch.userStory;
    const match = regex.exec(text);
    if (match) {
        const hiddenDocString = match[0].replace(/\S/g, ' ');
        text = text.substring(0, match.index) + hiddenDocString + text.substring(match.index + hiddenDocString.length);
    }
    return text;
}

function getLineKeyword(line) {
    const regex = firstMatch.keyword;
    const match = regex.exec(line);
    if (match) {
        return match[0].trim().replace(':', '');
    }
    return null;
}

module.exports = {
    replaceCommentsTags,
    replaceDocString,
    replaceStory,
    getLineKeyword,
};
