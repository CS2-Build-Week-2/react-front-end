const fs = require('fs')
const sha2256 = require('js-sha256');

const IslandMap = require('./Island');
const cli = require('../utils/cliCoin');
const axiosAuth = require('../utils/axiosAuth');
const [targetCoins,apiKey] = cli();

const ls8Code = fs.readFileSync('./ls8_code.txt','utf8');

console.log('apiKey in mineCoin', apiKey);
console.log('target coins to mine: ', targetCoins);
console.log(`decoded message from LS8: "${ls8Code}"`);

const regexNums = /[0-9]+$/;
let [mineID] = regexNums.exec(ls8Code);
mineID = Number(mineID);
console.log('room id of mining room: ', mineID);

async function mineCoin(targetCoins=null) {

    await gotoMineRoom();

    if (targetCoins) {
        const res = await axiosAuth(apiKey).get('/bc/get_balance');
        await island.wait(res.data.cooldown);
        var regexInt = /[0-9]+/;
        var [coins] = regexInt.exec(res.data.messages);  //using var for function scoping so other blocks can manipulate the variable.
        console.log('current balance: ', coins);
        var mine = {condition : (coins < targetCoins)};
    } else {
        let {name,has_mined} = await island.getinfo(apiKey);
        // var miningCondition = !has_mined;
        var mine = {condition : !has_mined};
        console.log(`${name} has mined ? ${has_mined}`)
    }

    while (mine.condition) {
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
            
            if (targetCoins) {
                res = await axiosAuth(apiKey).get('/bc/get_balance');
                await island.wait(res.data.cooldown);
                coins = regexInt.exec(res.data.messages);
                console.log(res.data.messages);
                console.log('current coin balance: ', coins);
                mine.condition = (coins < targetCoins);
            } else {
                const {name,has_mined} = await island.getinfo(apiKey);
                mine.condition = !has_mined;
                console.log(`${name} has mined ? ${has_mined}`)
            }

        } catch(err) {throw Error('unable to mine or get coin balance', err)}
    }
}

const island = new IslandMap()
island.loadGraph('./island-map.json');
// island.loadRooms('./rooms.json');

mineCoin(targetCoins);

function guess(last,nonce,difficulty) {
    const hash = sha2256(`${last}${nonce}`);
    let zeros = [];
    for (let i=0; i<difficulty; i++) {
        zeros.push('0');
    }
    zeros = zeros.join('');

    // console.log('hash(lastProof,nonce):', hash);
    const hashPrefix = hash.slice(0,zeros.length);
    return hashPrefix === zeros;
}

async function gotoMineRoom() {
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

    return mineRoom;
}





