module.exports = cliCoin;

function cliCoin() {
    let apiKey;
    let targetCoins;

    if (process.argv.length === 3) {
        if (process.argv[2].length === 40) {
            apiKey = process.argv[2];            
        } else {
            targetCoins = process.argv[2];
            apiKey = process.env.NEW_API_KEY;
        }
    } else if (process.argv.length === 4) {
        if (process.argv[2].length === 40) {
            apiKey = process.argv[2];
            targetCoins = process.argv[3];
        } else {
            targetCoins = process.argv[2];
            apiKey = process.argv[3];
        }
    } else {
        apiKey = process.env.NEW_API_KEY;
    }

    return [targetCoins,apiKey];
}