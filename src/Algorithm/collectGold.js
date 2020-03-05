const axiosAuth = require('../utils/axiosAuth');
const commandLineArgs = require('../utils/commandLineArgs');
// let apiKey;
// process.argv.length >= 3 ? apiKey = process.argv[3] : apiKey = process.env.NEW_API_KEY;
// process.argv.length >= 3 ? targetGold = process.argv[2] : targetGold = 1000;

const IslandMap = require('./Island');
const _ = require('underscore');
const fs = require('fs');

const island = new IslandMap();
island.loadGraph('./island-map.json');
island.loadRooms('./newrooms.json');

const [targetGold,apiKey] = commandLineArgs();
// console.log(targetGold,apiKey);


async function collectGold(target=1000) {
    
    const status = await getinfo()
    console.log('player status', status);
    let gold = status.gold;
    console.log('current gold', gold);
    
    while (gold < target) {
        let room = await island.currentRoom(apiKey);
        await findItems();
        await gotoShop(room);
        const stuff = await inventory();
        gold = await sellItems(stuff);
        console.log('total gold: ', gold);
    }
}

collectGold(targetGold);
// console.log('target gold', targetGold);
// console.log('api key', apiKey);


async function findItems() {

    let room = await island.currentRoom(apiKey);
    const status = getinfo()
    let weight = status.encumbrance;

    while (weight <= 15) {  //15 arbritrary value chosen to stop picking up items.
        room = await island.currentRoom(apiKey);
        console.log('start room', room.room_id, 'room items', room.items);

        if (room.items.length > 1) { //items in current room.  pick them up.

            for (item of room.items) {  //for of iterates through the values at the iterable.  for in = iterate through keys of iterable (array indices)
                try {
                    const [message] = await island.pickup(item,apiKey);
                    console.log(message);
                    // res.data.messages.length ? console.log(res.data.messages) : console.log(res.data.errors)
                    const res = await axiosAuth(apiKey).post('/adv/status')
                    console.log('total weight: ', res.data.encumbrance);
                    weight = res.data.encumbrance;
                    if (weight > 15) {
                        break;
                    }
                } 
                catch(err) {
                    throw Error(err);
                }
            }
        } 
        else {
            while (!room.items.length) {
                const neighbors = island.neighbors(room.room_id,true);  //true to return the exits with the neighids
                console.log('potential neighboring rooms with items: \n', neighbors);
                const [way,nextID] = _.sample(neighbors);
                // room = await island.travel(way,apiKey);
                room = await island.wiseMove(way,nextID,apiKey);
                room.items.length ? console.log(`items in room ${room.room_id}: ${room.items}`) : console.log('no items in room',room.room_id);
            }

            for (item of room.items) {  //for of iterates through the values at the iterable.  for in = iterate through keys of iterable (array indices)
                try {
                    const [message] = await island.pickup(item,apiKey);
                    console.log(message);
                    // res.data.messages.length ? console.log(res.data.messages) : console.log(res.data.errors)
                    const res = await axiosAuth(apiKey).post('/adv/status')
                    console.log('total weight: ', res.data.encumbrance);
                    weight = res.data.encumbrance;
                    if (weight > 15) {
                        break;
                    }
                } 
                catch(err) {
                    throw Error(err);
                }
            }
            // const item =  _.sample(room.items);
            // const msg = await island.pickup(item,apiKey);
            // console.log(msg);
        }
    }
    return room;
}


async function gotoShop(room) {
    const shopData = island.rooms.find(r => r.title == 'Shop');  //stored in an array of room data from the exploration script.
    const shopath = island.dfs(room.room_id,shopData.room_id);
    let stepRoom;
    let shop;
    console.log('path to shop', shopath);
    if (shopath.length === 1) {
        shop = await island.currentRoom(apiKey);
        console.log('at the shop.')
        return shop;
    }
    try {
        stepRoom = await island.backtrack(shopath,apiKey);  //room adjacent to the shop.
        const stepNeighbors = island.neighbors(stepRoom.room_id,true);
        const [way,rID] = stepNeighbors.find(wz => wz[1] === shopData.room_id);
        shop = await island.wiseMove(way,rID,apiKey);
        console.log('made it to the shop:',shop.room_id);
        return shop;
    }
    catch(err) {
        throw Error(err);
    }
}

async function sellItems(stuff) {
    // const item = stuff[0];
    console.log('stuff in sellItems', stuff);
    try {
        const {gold} = await getinfo();
        return gold;
    } catch(err) {
        throw Error('cannot get player info from sellItems', err);
    }
    
    // for (item of stuff) {
    //     console.log('item to sell', item);
    //     try {
    //         const res = await axiosAuth(apiKey).post('/adv/sell', {name : item, confirm : 'yes'});
    //         console.log(res.data.messages);
    //         await island.wait(res.data.cooldown);
    //         // console.log('sold item', item);
    //     } catch(err) {
    //         throw Error('unable to sell item ', item, err)
    //     }
    // }
    
}


async function inventory() {
    try {
        const res = await axiosAuth(apiKey).post('adv/status')
        await island.wait(res.data.cooldown);
        return res.data.inventory
    } catch(err) {
        throw Error('unable to get inventory', err)
    }
}

async function getinfo() {
    try {
        const res = await axiosAuth(apiKey).post('adv/status')
        await island.wait(res.data.cooldown);
        const playerInfo = res.data;
        return playerInfo;
    } catch(err) {
        throw Error('unable to get player info', err)
    }
}







            // try {
            //     const item =  _.sample(room.items);
            //     await island.pickup(item,apiKey);
            // } 
            // catch(err) {
            //     throw Error(err);
            // }

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


// if (process.argv.length >= 3) {
//     console.log('process.argv', process.argv.length);
//     apiKey = process.argv[2];
//     // console.log(apiKey);
// } else {
//     console.log('token');
//     apiKey = token;
// }








