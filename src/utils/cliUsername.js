module.exports = cliUsername;

function cliUsername() {
    let apiKey;
    let username;

    if (process.argv.length === 3) {
        if (process.argv[2].length === 40) {
            apiKey = process.argv[2];
            username = 'jazeera';            
        } else {
            username = process.argv[2];
            apiKey = process.env.NEW_API_KEY;
        }
    } else if (process.argv.length === 4) {
        if (process.argv[2].length === 40) {
            apiKey = process.argv[2];
            username = process.argv[3];
        } else {
            username = process.argv[2];
            apiKey = process.argv[3];
        }
    } else {
        apiKey = process.env.NEW_API_KEY;
        username = 'jazeera';
    }

    return [username,apiKey];
}