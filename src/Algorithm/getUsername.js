const IslandMap = require('./Island');
const cli = require('../utils/cliUsername');
const [username,apiKey] = cli();
const axiosAuth = require('../utils/axiosAuth');

console.log('username', username,'apikey', apiKey);

const island = new IslandMap();
island.loadGraph('./island-map.json');
island.loadRooms('./rooms.json');

async function getUsername() {
    
    try {var room = await island.currentRoom(apiKey)} catch (err) {throw Error('cannot get current room', err)}
   

    let pirateRoom = island.rooms.find(r => r.room_id == 467) || {room_id : 467}
    const piratePath = island.dfs(room.room_id,pirateRoom.room_id);
    console.log('path to pirate room', piratePath);

    if (piratePath.length <= 2) {
        try {
            pirateRoom = await oneStep(room.room_id,pirateRoom.room_id);
            console.log("made it to Pirate Ry's", pirateRoom);
        } catch(err) {throw Error('cannot oneStep', err)}
    }

    else {
        try {
            room = await island.backtrack(piratePath,apiKey);
            console.log('room from backtrack', room.room_id)
            pirateRoom = await oneStep(room.room_id,pirateRoom.room_id);
            console.log('made it to pirate room', pirateRoom);
        } catch(err) {throw Error('cannot backtrack or oneStep', err)}
    }
    ///////////////

    try {
        const nameMsg = await changeName();
        console.log('message from change name', nameMsg);
        const {name} =  await island.getinfo(apiKey);
        console.log('new username: ', name);
    } catch(err) {throw Error('did not change name successfully', err)}
    
}

getUsername();

async function changeName() {
    try {
        const res = await axiosAuth(apiKey).post('/adv/change_name',{name : username, confirm : 'aye'})
        return res.data.messages;
    } catch(err) {
        throw Error('cannot change name', err);
        // console.log(err);
    }
}



async function oneStep(roomID,stepID) {
    console.log('roomID in oneStep', roomID, 'stepID', stepID);

    if (roomID === stepID) {
        try {
            const room =  await island.currentRoom(apiKey);
            console.log('already made it to room', stepID);
            return room;
        } catch(err) {throw Error('current room', err)}
    } 
    
    else {
        const stepNeighbors = island.neighbors(roomID,true);
        const [way,rID] = stepNeighbors.find(wz => wz[1] === stepID);
        try {
            const room = await island.wiseMove(way,rID,apiKey);
            console.log('made it to room: :',shop);
            return room;
        } catch(err) {throw Error('could not move to shop next door', err)}
    }
}


// const wishingWell = island.rooms.find(r => r.title === "Wishing Well");
// const shop = island.rooms.find(r => r.room_id == 1);