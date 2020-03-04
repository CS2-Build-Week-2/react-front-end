const IslandMap = require('./Island');
const fs = require('fs');
process.argv.length >= 3 ? apiKey = process.argv[2] : apiKey = process.env.NEW_API_KEY;
const island = new IslandMap();
island.loadGraph('./island-map.json');
island.loadRooms('./rooms.json');
const _ = require('underscore');

function sortRooms(island) {
    let sorted = island.rooms.sort((roomA,roomB) => Number(roomA.room_id) > Number(roomB.room_id) ? 1 : -1);
    sorted = sorted.map(room => JSON.stringify(room));
    sorted = new Set(sorted);
    const jsoned = [];
    sorted.forEach(room => jsoned.push(JSON.parse(room)))

    const explored = jsoned.map(r => r.room_id);
    // console.log(explored);

    fs.writeFile('rooms.json', JSON.stringify(jsoned,null,'\t'), 'utf8', (err) => {
        if (err) throw Error(err);
        console.log('sorted rooms written to file');
    })

    fs.writeFile('explored.json', JSON.stringify(explored,null, '\t'), 'utf8', (err) => err ? Error(err) : console.log('explored room ids written to file'));
    return explored;
}

// const explored = sortRooms(island);


function getUnexplored(explored) {
    const unexplored = [];
    console.log('explored in getUnexp', explored.length);

    for (let i=0; i<500; i++) {
        if (!explored.includes(i)) {
            unexplored.push(i);
        }
    }
    console.log(unexplored.length);
    fs.writeFile('unexplored.json', JSON.stringify(unexplored, null, '\t'), (err) => err ? Error(err) : console.log('unexplored written to file'));
}

// getUnexplored(explored);

async function recordRooms(island) {
    // console.log('island in recordroom', island.grid);
    let unexplored = require('./unexplored.json');

    while (unexplored.length) {
            console.log('unexplored rooms:', unexplored.length)
            let room = await island.currentRoom(apiKey);
            console.log('room in recordRooms', room.room_id);


            const dfsPaths = [];

            for (let i=0; i<unexplored.length; i++) {
                const currID = room.room_id;
                const newID = unexplored[i];
                const path = island.dfs(currID,newID);
                dfsPaths.push(path);
            }

            const sortedPaths = dfsPaths.sort((a,b) => a.length > b.length ? 1 : -1);
            // console.log(sortedPaths);
            sortedPaths.shift() //remove 1 element dfs path same room.
            const shortPath = sortedPaths[0];
            const endID = shortPath[shortPath.length - 1];
            console.log('endID', endID);
            console.log('shortest path to unrecorded room', shortPath);  //this is the closest room that has not been recorded.
            const stepRoom = await island.backtrack(shortPath,apiKey);
            console.log('finished backtracking to ', stepRoom.room_id, 'now moving to target room',endID);
            const stepNeighbors = island.neighbors(stepRoom.room_id,true);
            // console.log('stepNeighbors', stepNeighbors);
            // const wayExit = stepNeighbors.filter(wr => wr[1] === endID);
            const [way,rID] = stepNeighbors.find(wz => wz[1] === endID);
            console.log(way,rID);
            const roomToRecord = await island.wiseMove(way,rID,apiKey);
            console.log(roomToRecord);
            island.rooms.push(roomToRecord);
            fs.writeFile('newrooms.json', JSON.stringify(island.rooms,null,'\t'), err => err ? Error(err) : console.log('wrote rooms to newrooms.json'));

            const i = unexplored.indexOf(roomToRecord.room_id);  //find the index of the room that was recorded.
            unexplored.splice(i,1);
            fs.writeFile('updated_unexplored.json', JSON.stringify(unexplored,null,'\t'), err => err ? Error(err) : console.log('updated unexplored rooms.json'));
        }


    }

    


recordRooms(island);
