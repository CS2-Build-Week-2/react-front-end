const fs = require('fs')
const sha2256 = require('js-sha256');

const IslandMap = require('./Island');
const cli = require('../utils/cliUsername');
const axiosAuth = require('../utils/axiosAuth');
const [,apiKey] = cli();

const ls8Code = fs.readFileSync('./ls8_code.txt','utf8');

console.log(`decoded message from LS8: "${ls8Code}"`);
console.log('apiKey in mineCoin', apiKey);

const regexNums = /[0-9]+$/;
let [mineID] = regexNums.exec(ls8Code);
mineID = Number(mineID);

console.log(mineID);

async function mineCoin() {
    let room = await island.currentRoom(apiKey);
    const minePath = island.dfs(room.room_id,mineID);
    console.log('path to mining room', minePath);

    if (minePath.length <= 2) {
        var mineRoom = await island.oneStep(room.room_id,mineID,apiKey);
        console.log('at mine room', mineRoom);
    }

    else {
        const step = await island.backtrack(minePath,apiKey);
        var mineRoom = await island.oneStep(step.room_id,mineID,apiKey);
        console.log('made it to the mine room', mineRoom);
    }

    let {has_mined} = await island.getinfo(apiKey);

    while (!has_mined) {
        try { //get the last proof & difficulty level from api
            const res = await axiosAuth(apiKey).get('/bc/last_proof');
            var {proof,difficulty} = res.data;
        } catch(err) {throw Error('unable to mine coin', err)}

        console.log('last proof', proof);

        let nonce = 0; //new proof
        while (!guess(proof,nonce,difficulty)) {  //keep hashing with incrementing nonce until a hash with leading 000's is found
            nonce += 1;
        }
    
        console.log('nonce used to get valid hash: ', nonce);

        try {
            let res = await axiosAuth(apiKey).post('/bc/mine',{proof : nonce});
            await island.wait(res.data.cooldown);
            console.log(res.data);
            res = await axiosAuth(apiKey).get('/bc/get_balance');
            await island.wait(res.data.cooldown);
            const player = await island.getinfo(apiKey);
            has_mined = player.has_mined;
            console.log(res.data.messages);
            console.log(`${player.name} has mined ? ${player.has_mined}`);
        } catch(err) {throw Error('unable to mine or get coin balance', err)}
    }
}

const island = new IslandMap()
island.loadGraph('./island-map.json');
// island.loadRooms('./rooms.json');

mineCoin();


function guess(last,nonce,difficulty) {
    const hash = sha2256(`${last}${nonce}`);
    let zeros = [];
    for (let i=0; i<difficulty; i++) {
        zeros.push('0');
    }
    zeros = zeros.join('');

    console.log('hash(lastProof,nonce):', hash);
    const hashPrefix = hash.slice(0,zeros.length);
    return hashPrefix === zeros;
}





