const IslandMap = require('./Island');
const fs = require('fs');
// process.argv.length >= 3 ? apiKey = process.argv[2] : apiKey = process.env.NEW_API_KEY;
const _ = require('underscore');
const commandLineArgs = require('../utils/commandLineArgs');
const [,apiKey] = commandLineArgs();  //1st element is gold, not used in this file.
const util = require('util');
const fs_WriteFile = util.promisify(fs.writeFile);

console.log('apiKey in sortRecord', apiKey);

function sortWriteRooms() {
    //sorts by room_id and removes duplicate room entries.
    console.log('sort write rooms');
    let sorted = island.rooms.sort((roomA,roomB) => Number(roomA.room_id) > Number(roomB.room_id) ? 1 : -1);
    sorted = sorted.map(room => JSON.stringify(room));
    sorted = new Set(sorted);
    const jsonedSorted = [];
    sorted.forEach(room => jsonedSorted.push(JSON.parse(room)))
   
    // await fs_WriteFile('rooms.json', JSON.stringify(jsonedSorted,null,'\t'), 'utf8', (err) => {
    //     if (err) throw Error(err);
    //     console.log('sorted rooms written to file: "./rooms.json"  ');
    // });
    fs.writeFile('rooms.json', JSON.stringify(jsonedSorted,null,'\t'), 'utf8', (err) => {
        if (err) throw Error(err);
        console.log('sorted rooms written to file: "./rooms.json"  ');
    });

    // console.log('sorted rooms length', jsonedSorted.length);

    return jsonedSorted;  //sorted room data. same as the 
    

    // const explored = jsoned.map(r => r.room_id);
    // console.log(explored);

    // 
}

// const explored = sortRooms(island);


function getUnexplored() {  //removed explored from parameter
    const rooms = sortWriteRooms();
    // console.log('rooms in getunexp', rooms.length);
    const explored = rooms.map(r => r.room_id);
    const unexplored = [];

    console.log('explored rooms in getUnexpplored', explored.slice(0,10));

    for (let i=0; i<500; i++) {
        if (!explored.includes(i)) {
            // console.log(i,'not found in explored. pushing to unexplored.');
            unexplored.push(i);
        }
    }
    console.log('unexplored rooms in getUnexplored', unexplored.slice(0,10));

    fs.writeFile('explored.json', JSON.stringify(explored,null, '\t'), (err) => err ? Error(err) : console.log('explored written to file'));

    fs.writeFile('unexplored.json', JSON.stringify(unexplored, null, '\t'), (err) => err ? Error(err) : console.log('unexplored written to file'));

    return unexplored;
}

// getUnexplored(explored);

async function recordRooms() {
    // console.log('island in recordroom', island.grid);
    // let unexplored = require('./updated_unexplored.json');
    let unexplored = getUnexplored();
    console.log(unexplored, 'in recordRooms');

    while (unexplored.length) {
            console.log('unexplored rooms:', unexplored.length)
            let room = await island.currentRoom(apiKey);
            console.log('room in recordRooms', room.room_id);
            const dfsPaths = [];

            for (let i=0; i<unexplored.length; i++) {  //calc the dfs path from current room to every room in unexplored.
                const currID = room.room_id;
                const newID = unexplored[i];
                const path = island.dfs(currID,newID);
                dfsPaths.push(path);
            }

            const sortedPaths = dfsPaths.sort((a,b) => a.length > b.length ? 1 : -1);  //put shortest paths first.
            // console.log(sortedPaths);
            sortedPaths.shift() //remove 1 element dfs path same room.
            // const shortPath = sortedPaths[0];
            const shortPath = sortedPaths.find(p => p.length > 1);
            const endID = shortPath[shortPath.length - 1];
            
            console.log('endID', endID);
            console.log('shortest path to unrecorded room', shortPath);  //this is the closest room that has not been recorded.
            
            const stepRoom = await island.backtrack(shortPath,apiKey);
            console.log('finished backtracking to ', stepRoom.room_id, 'now moving to target room',endID);
            const stepNeighbors = island.neighbors(stepRoom.room_id,true);  //true to return the exits/ways, not just exits.
            const [way,rID] = stepNeighbors.find(wz => wz[1] === endID);
            console.log(way,rID);
            const roomToRecord = await island.wiseMove(way,rID,apiKey);
            console.log('arrived at room to record', roomToRecord.room_id);

            island.rooms.push(roomToRecord);
            fs.writeFile('rooms.json', JSON.stringify(island.rooms,null,'\t'), err => err ? Error(err) : console.log('wrote rooms to rooms.json'));
            const i = unexplored.indexOf(roomToRecord.room_id);  //find the index of the room that was recorded.
            unexplored.splice(i,1);
            fs.writeFile('updated_unexplored.json', JSON.stringify(unexplored,null,'\t'), err => err ? Error(err) : console.log('updated unexplored rooms.json'));
        }
    }


const island = new IslandMap();
island.loadGraph('./island-map.json');
island.loadRooms('./rooms.json');
recordRooms();
