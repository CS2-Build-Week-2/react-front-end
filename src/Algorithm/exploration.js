const IslandMap = require('./Island.js');

//TODO: write out grid to JSON
const fs = require('fs');


async function wrapper() {

    async function exploration() {
        const rooms = [];
        const island = new IslandMap();
        let r = null;
        while (island.size() < 500) {
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
            console.log(island.grid)
            const newWay = island.unexplore(roomID);
            console.log('newWay', newWay);
            if (!newWay) {
                const trail = island.bfs(roomID);
                console.log('trail after bfs', trail)
                if (!trail) {
                    break;
                }
                await island.backtrack(trail);
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
                console.log('next room', next);
                island.loadRoom(next.room_id, next.exits);
                island.updateRooms(roomID,newWay,next.room_id);
                }
                console.log(island.grid);
                fs.writeFile('island-map.json', JSON.stringify(island.grid, null, "\t"), 'utf8', (err) => {
                    if (err) throw err; 
                    console.log(`${JSON.stringify(island.grid[roomID])} written to file`);
                })
                rooms.push(r);
                fs.writeFile('island-rooms.json', JSON.stringify(rooms, null, "\t"), 'utf8', (err) => {
                    if (err) throw Error(err);
                    console.log(`${r.room_id} written to file`);
                })
            }
            return island;
        }

    const mapped = await exploration();
    console.log(mapped.grid,mapped.path);
}
wrapper();