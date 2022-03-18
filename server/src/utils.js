function removeCommentsTags(text) {
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

module.exports = {
    removeCommentsTags,
};
