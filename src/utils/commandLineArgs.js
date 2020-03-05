

function commandLineArgs() {
    let apiKey=null;
    let targetGold=null;
    if (process.argv.length === 3) {
        if (process.argv[2].length > 5) {
            apiKey = process.argv[2];
            targetGold = 1000;
        } else {
            targetGold = process.argv[2]
            apiKey = process.env.NEW_API_KEY;
        }
    } else if (process.argv.length === 4) {
        if (process.argv[2].length > 5) {
            apiKey = process.argv[2];
            targetGold = process.argv[3];
        } else {
            targetGold = process.argv[2];
            apiKey = process.argv[3];
        }
    } else {
        apiKey = process.env.NEW_API_KEY;
        targetGold = 1000;
    }

    return [targetGold,apiKey]
}

module.exports = commandLineArgs;