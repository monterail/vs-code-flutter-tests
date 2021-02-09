
///Returns the numbers of tests found inside of the given [fileContent]
export function getNumberOfTests(fileContent: string): number {
    let regex = /^\s*test\s*\(/gm; //Looks for "test(" with whitespaces between

    var matches = fileContent.match(regex);

    if(matches === undefined || matches === null) {
        return 0;
    }
    else {
        return matches.length;
    }
}