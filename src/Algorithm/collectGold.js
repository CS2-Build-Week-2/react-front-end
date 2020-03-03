const axiosAuth = require('../utils/axiosAuth');
let apiKey;
process.argv.length >= 3 ? apiKey = process.argv[2] : apiKey = process.env.API_KEY;

function collectGold() {
    return
}


// if (process.argv.length >= 3) {
//     console.log('process.argv', process.argv.length);
//     apiKey = process.argv[2];
//     // console.log(apiKey);
// } else {
//     console.log('token');
//     apiKey = token;
// }

console.log(apiKey);









