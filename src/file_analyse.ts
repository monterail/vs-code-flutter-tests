
///Returns the numbers of tests found inside of the given [fileContent]
export function getNumberOfTests(fileContent: string): number {
    return getNumberOfNormalTests(fileContent) + getNumberOfBlocTests(fileContent);
}

function getNumberOfNormalTests(fileContent: string): number {
    let regex = /^\s*test\s*\(/gm; //Looks for "test(" with whitespaces between

    return getMatchesOfRegex(fileContent, regex);
}

function getNumberOfBlocTests(fileContent: string): number {
    let regex = /^\s*blocTest\s*</gm; //Looks for "blocTest<" with whitespaces between

    return getMatchesOfRegex(fileContent, regex);
}

function getMatchesOfRegex(fileContent: string, regex: RegExp) {
    var matches = fileContent.match(regex);

    if(matches === undefined || matches === null) {
        return 0;
    }
    else {
        return matches.length;
    }

}