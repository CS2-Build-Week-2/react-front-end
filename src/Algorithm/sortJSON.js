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
    const unexplored = require('./unexplored.json');
    let room = await island.currentRoom(apiKey);
    console.log('room in recordRooms', room.room_id);

    dfsPaths = [];

    for (let i=0; i<unexplored.length; i++) {
        const currID = room.room_id;
        const newID = unexplored[i];
        const path = island.dfs(currID,newID);
        dfsPaths.push(path);
    }

    const sortedPaths = dfsPaths.sort((a,b) => a.length > b.length ? 1 : -1);
    // console.log(sortedPaths);
    sortedPaths.shift()
    console.log(sortedPaths[0]);  //this is the closest room that has not been recorded.
    
    



    // unexplored.forEach(rID => {

    // })

}


recordRooms(island);
