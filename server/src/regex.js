module.exports = {
    globalMatch: {
        feature: /(?<!\S)(?:^| )Feature:/gm,
        beginningStep:
            /(?<=(Background:|Scenario( (Outline|Template))?:|Example:)(.*)[\n\r](\s)*)(Given|When|Then|And|But)(?= )/g,
        docString: /"""[\s\S]*?"""/g,
    },
    firstMatch: {
        step: /(Given|When|Then|And|But)(?= )/,
        userStory: /(?<=Feature:.*[\r\n])\s*As (.*)\s*I (.*)\s*So that (.*)/,
        keyword:
            /(?<=^(\t| )*)((Feature:|Rule:|Background:|Scenario:|Example:|Scenario Outline:|Scenario Template:|Examples:|Scenarios:|#|@|""")|(Given|When|Then|And|But)(?= )|\|[\S\t ]*\|)/,
    },
};
