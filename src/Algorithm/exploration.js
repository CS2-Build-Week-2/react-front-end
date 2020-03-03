const IslandMap = require('./Island.js');

//TODO: write out grid to JSON
const fs = require('fs');


async function wrapper() {

    async function exploration() {
        const island = new IslandMap();
        // island.loadGraph('island-map.json');
        // island.loadRooms('island-rooms.json');
        // const rooms = [];
        let r = null;
        while (island.size() < 500) {
            console.log('size of map:', island.size());
            try {
                r = await island.currentRoom();
                console.log('current room in exploration', r.room_id);
                await island.wait(r.cooldown);
            } catch(err) {
                throw Error(`unable to get current room... ${err}`)
            }

            const roomID = r.room_id;
            const exits = r.exits;
           
            console.log('current room : ', r.room_id,r.exits);
            island.loadRoom(roomID,exits);
            // console.log(island.grid)
            const newWay = island.unexplore(roomID);
            console.log('way', newWay);
            if (!newWay) {
                console.log(`no unexplored rooms here at ${roomID}. doing BFS to search for an unexplored exit...`);
                // console.log(island.grid);
                const path = island.bfs(roomID);
                console.log('path after bfs', path)
                if (!path) {
                    break;
                }
                await island.backtrack(path);
                continue;
            } else { 
                let next = null;
                try {
                    next = await island.travel(newWay);
                    island.path.push(newWay);
                    await island.wait(next.cooldown);
                } catch(err) {
                    throw Error(err);
                }
                console.log('next room', next.room_id);
                island.loadRoom(next.room_id, next.exits);
                island.updateRooms(roomID,newWay,next.room_id);
                }
                // console.log(island.grid);
                fs.writeFile('island-map.json', JSON.stringify(island.grid, null, "\t"), 'utf8', (err) => {
                    if (err) throw err; 
                    console.log(`${roomID} : ${JSON.stringify(island.grid[roomID])} written to file`);
                })
                // rooms.push(r);
                island.rooms.push(r)
                fs.writeFile('island-rooms.json', JSON.stringify(island.rooms, null, "\t"), 'utf8', (err) => {
                    if (err) throw Error(err);
                    console.log(`Room #${r.room_id} written to file`);
                });
                fs.writeFile('path1.json', JSON.stringify(island.path), 'utf8', (err) => {
                    if (err) throw Error(err);
                    console.log(`path written to file`);
                })
            }
            return island;
        }

    const start = Date.now();
    const mapped = await exploration();
    const end = Date.now();
    console.log('Execution time: ', Math.ceil((end - start) / 1000),'seconds');
    console.log(mapped.grid,mapped.path);
}
wrapper();