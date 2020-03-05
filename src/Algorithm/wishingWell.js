const IslandMap = require('./Island');
const island = new IslandMap();
island.loadGraph('./island-map.json')
island.loadRooms('./rooms.json');
const cli = require('../utils/cliUsername');
const axiosAuth = require('../utils/axiosAuth');

const [,apiKey] = cli();

console.log('apiKey in wishingWell', apiKey);


async function wishingWell() {
    try {
        var room = await island.currentRoom(apiKey);  //var for function scoping.
    } catch(err) {throw Error('cannot get current room', err)}

    let well = island.rooms.find(r => r.title === 'Wishing Well' || r.room_id === 55);
    if (!well) well = {room_id : 55};

    console.log('well', well.room_id, 'room',room.room_id);

    const wellPath = await island.dfs(room.room_id,well.room_id);
    console.log('path to the well', wellPath);

    if (wellPath.length <= 2) {
        well = await island.oneStep(room.room_id,well.room_id);
        console.log('made it to the well', well);
    } else {
        try {
            room = await island.backtrack(wellPath,apiKey);
            well = await island.oneStep(room.room_id,well.room_id);
            console.log('made it to the well', well);
        } catch(err) {throw Error('unable to make it to the wishing well', err)};
    }

    // well = await island.currentRoom(apiKey);
    const water = await gaze();
    console.log(water);
}

async function gaze() {
    try {
        const res = await axiosAuth(apiKey).post('/adv/examine', {name : 'well'});
        console.log(res);
        // await island.wait(res.data.cooldown)
        // console.log(res.data);
        return res.data;
    } catch(err) {throw Error('unable to gaze into the waters')}
}



wishingWell();