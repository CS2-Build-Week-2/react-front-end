const axiosAuth = require('../utils/axiosAuth');
// let apiKey;
process.argv.length >= 3 ? apiKey = process.argv[2] : apiKey = process.env.NEW_API_KEY;
const IslandMap = require('./Island');
const _ = require('underscore');


//check current room for items.
//if no items in current room:
//filter for room with items in it from json file
//get bfs path to that room
//backtrack to that room

//repeat until encumbrance maxed out
//find location of shop
//get bfs path to the shop.
//backtrack to the shop
//sell items and collect gold.  
//repeat this while gold is less than target

async function collectGold(target=1000) {
    const island = new IslandMap();
    island.loadGraph('./island-map.json');
    island.loadRooms('./island-rooms.json');
    // console.log(island.grid);
    //
    // const room = axiosAuth(apiKey).get('/adv/init').then(res => res.data);
    const {data} = await axiosAuth(apiKey).get('/adv/init');
    const room = data;
    await island.wait(room.cooldown);
    // const way = _.sample(room.exits);
    // console.log(way);

    // const res2 = await axiosAuth(apiKey).post('/adv/move',{direction : way});
    // const room2 = res2.data;
    // console.log(room2);
    // await island.wait(room2.cooldown);


    if (room.items.length > 1) {
       const item =  _.sample(room.items);
       console.log(item);
    } else {
        const roomItems = island.rooms.filter(r => r.items.length);
        // const stuffedRoom = _.sample(roomItems);
        // console.log(stuffedRoom.room_id);
        let itemrooms = roomItems.map(r => r.room_id);
        console.log('itemRooms', itemrooms);
        console.log('current room', room.room_id);
        //min val of absolute value(rID - room.room_id)
        const diffs = itemrooms.map(ri => Math.abs(ri - room.room_id));
        const nextID = Math.min(...diffs);
        console.log('nextID', nextID);
        // const nextID = Math.min(roomIds);
        // console.log(nextID);
    }
}

collectGold();



// if (process.argv.length >= 3) {
//     console.log('process.argv', process.argv.length);
//     apiKey = process.argv[2];
//     // console.log(apiKey);
// } else {
//     console.log('token');
//     apiKey = token;
// }








