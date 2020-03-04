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
    let room = await island.currentRoom(apiKey);
    console.log('start room', room);

    if (room.items.length > 1) { //items in current room.  pick them up.
       const item =  _.sample(room.items);
       console.log(item);
       await island.pickup(item,apiKey);
    } 
    else {
        while (!room.items.length) {
            const neighbors = island.neighbors(room.room_id,true);  //true to return the exits with the neighids
            console.log('potential neighboring rooms with items: \n', neighbors);
            const [way,nextID] = _.sample(neighbors);
            // room = await island.travel(way,apiKey);
            room = await island.wiseMove(way,nextID,apiKey);
            console.log('cooldown wise move', room.cooldown);
            room.items.length ? console.log(`items in room ${room.room_id}: ${room.items}`) : console.log('no items in room');
        }

        const item =  _.sample(room.items);
        const inventory = await island.pickup(item,apiKey);
        console.log('inventory', inventory);
    }

    // else {  //find the closest room with an item.  
    //     const roomsWithItems = island.rooms.filter(r => r.items.length && r.room_id !== room.room_id);
    //     const itemRoomIds = roomsWithItems.map(r => r.room_id);
    //     const currID = room.room_id;
    //     const dfsPaths = [];
    //     // const bfsPaths = [];
    //     itemRoomIds.forEach(rID => {
    //         const dfsPath = island.dfs(currID,rID);
    //         dfsPaths.push(dfsPath);
    //         // const bfsPath = island.bfs(currID,rID);
    //         // bfsPaths.push(bfsPath);
    //     })
    //     //calculate the shortest dfs path from current room to room with items in it.
    //     const sizesDfs = dfsPaths.map(dp => dp.length);
    //     const minDfs = Math.min(...sizesDfs);
    //     const dfsIndex = sizesDfs.indexOf(minDfs);
    //     const path = dfsPaths[dfsIndex];
    //     const target = path[path.length - 1];
    //     console.log('shortest dfs path: ', path);

    //     if (path.length <= 2) {
    //         const [exit] = Object.entries(island.grid[currID]).filter(way => way[1] === target);
    //         const [way,rID] = exit;
    //         const itemRoom = await island.travel(way,apiKey);
    //         console.log('item room',  itemRoom);
    //         //pickup item
    //         // await island.wait(next.cooldown);
    //     } else {
    //         const itemRoom = await island.backtrack(path);
    //         console.log(itemRoom.room_id);
    //         //pickup item TODO:
    //     }
    // }
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








