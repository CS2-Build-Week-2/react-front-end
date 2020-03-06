require('dotenv').config();
const axiosAuth = require('../utils/axiosAuth');
const token = process.env.NEW_API_KEY;
// const us = require('underscore');
const _ = require('underscore');
const Queue = require('../utils/queue');
const Stack = require('../utils/stack');
const fs = require('fs');

class IslandMap {
    constructor() {
        this.grid = {};
        this.path = [];
        this.rooms = [];
        this.roomData = new Set();
    }

    output = (filename,object) => {
        fs.writeFile(filename, JSON.stringify(object, null, "\t"), 'utf8', (err) => {
            if (err) throw err; 
            console.log(`${object} written to file`);
        })
    }

    loadGraph = (filename) => {
        const data = require(`./${filename}`);
        this.grid =  data;
    }

    loadRooms = (filename) => {
        const data = require(`./${filename}`);
        this.rooms = data;
        this.roomData = new Set(data);
    }

    dfs = (startID, endID) => {
        const s = new Stack([startID]);
        const visited = new Set();
        // s.push([startID]);
        // console.log(s);
        let runCounter = 0;

        while (s.size() > 0) {
            const path = s.pop();
            const roomID = path[path.length - 1];
            if (!visited.has(roomID)) {
                if (roomID == endID) {
                    // console.log('run counter for dfs: ', runCounter);
                    return path;
                } else {
                    visited.add(roomID);
                }
                const neighIDs = this.neighbors(roomID);
                neighIDs.forEach(nID => {
                    const longerPath = [...path];
                    longerPath.push(nID);
                    s.push(longerPath);
                })
            }
            runCounter++;
        }
    }


    bfs = (roomID, destID='?') => {
        const q = new Queue([roomID]);
        const visited = new Set();
        // q.enque([roomID]);
        // console.log(q);
        // console.log('current room', roomID);
        let runCounter = 0;
        while (q.size() > 0) {
            // console.log('queue length', q.size());
            const path = q.deque();
            // console.log('queue with all paths: ', q);
            // console.log('oldest path dequed',path);
            const rID = path[path.length-1];
            // console.log('roomID', rID);
            // console.log('visited', visited);
            // console.log('roomID in visited', visited.has(rID))

            if (!visited.has(rID)) {
                if (rID === destID) {
                    // console.log('run counter for bfs: ', runCounter);
                    return path;
                } else {
                    visited.add(rID);
                    const nextIDs = this.neighbors(rID); 
                    // console.log('neighbor roomIDs: ', nextIDs);
                    nextIDs.forEach(nID => {
                        const newPath = [...path];
                        newPath.push(nID);
                        q.enque(newPath);
                    })
                }
                
            }
            runCounter++;
        }
    }

    backtrack = async (trail,apiKey=token) => {
        let roomID = trail.shift();
        trail.pop(); // get rid of the first and last elements of the trail.  to get to the room that has unexplored exits.
        console.log('trail in backtrack', trail);
        let next = null;
        for (let i=0; i<trail.length; i++) {
            // console.log('i in for loop of backtrack', i, 'roomID', roomID, trail[i]);
            const step = trail[i];
            // console.log('step', step);
            let [waze] = Object.entries(this.grid[roomID]).filter(way => this.grid[roomID][way[0]] == step);
            // nextWay = nextWay[0];
            const [nextWay,rID] = waze;

            // console.log('nextWay in backtrack', nextWay);
            // console.log('roomID', roomID);
            // console.log(this.grid);
            
            try {
                // console.log(nextWay)
                console.log('roomID', roomID, 'way', nextWay, 'stepping room', step);
                console.log('backtracking traveling...');
                // next = await this.travel(nextWay); //TODO: WISE EXPLORER
                next = await this.wiseMove(nextWay,rID,apiKey);
                await this.wait(next.cooldown); 
                console.log('backtracked 1 room to:', next.room_id);
                // const room = await this.currentRoom();
                roomID = next.room_id;
                this.path.push(nextWay);
            } catch(err) {
                throw Error(err);
            }
            // this.output('test.json',this.grid);
        }
        return next;
    }

    neighbors = (rID,waze=false) => {
        // const neighWaze = Object.entries(this.grid[rID]).filter(w => w[1]);
        const neighWaze = Object.entries(this.grid[rID])

        if (waze) {
            return neighWaze;
        }
       
        // console.log('neighbors of room', rID, neighWaze);
        const neighIDs = neighWaze.map( way => way[1])
        // console.log(neighIDs);
        return neighIDs;
    }

    travel = async (way,apiKey=token) => {
        try {
            const res = await axiosAuth(apiKey).post('/adv/move',{direction : way});
            const room = res.data;
            await this.wait(room.cooldown);
            return room;
        } catch(err) {
            console.log('error traveling',err.response.data);
        }
    }

    wiseMove = async (way,rID,apiKey=token) => {
        try {
            const res = await axiosAuth(apiKey).post('/adv/move',{direction : way, next_room_id : String(rID)});
            const room = res.data;
            console.log('wise move cool down: ', room.cooldown);
            await this.wait(room.cooldown);
            return room;
        } catch(err) {
            console.log('error traveling',err.response.data);
        }
    }

    oneStep = async (roomID,stepID,apiKey=token) => {
        console.log('roomID in oneStep', roomID, 'stepID', stepID);
    
        if (roomID === stepID) {
            try {
                const room =  await this.currentRoom(apiKey);
                console.log('already at the room', stepID);
                return room;
            } catch(err) {throw Error('current room', err)}
        } 
        
        else {
            const stepNeighbors = this.neighbors(roomID,true);
            const [way,rID] = stepNeighbors.find(wz => wz[1] === stepID);
            try {
                const room = await this.wiseMove(way,rID,apiKey);
                return room;
            } catch(err) {throw Error('could not move to shop next door', err)}
        }
    } 


    size = () => {
        return Object.keys(this.grid).length
    }

    wait = (sec) => {
        let millisecs = sec * 1000;
        return new Promise((resolve,reject) => setTimeout(() => resolve('time to move!'),millisecs));
    }

    currentRoom = async (apiKey=token) => {
        try {
            const res = await axiosAuth(apiKey).get('/adv/init');
            const room = res.data;
            await this.wait(room.cooldown);
            // console.log(room);
            return room;
        } catch(err) {
            // console.log(err.response.data.detail);
            return err.response.data.detail;
        }
    }

    getinfo = async (apiKey=token) => {
        try {
            const res = await axiosAuth(apiKey).post('adv/status')
            await this.wait(res.data.cooldown);
            const playerInfo = res.data;
            return playerInfo;
        } catch(err) {
            throw Error('unable to get player info', err)
        }
    }

    pickup = async (item,apiKey=token) => {
        try {
            const res = await axiosAuth(apiKey).post('/adv/take',{name : item});
            await this.wait(res.data.cooldown);
            // console.log('pickup response', res.data);
            // const status = await axiosAuth(apiKey).post('/adv/status');
            // await this.wait(status.data.cooldown)
            // return status.data.inventory
            return res.data.messages.length ?res.data.messages : res.data.errors
        } catch(err) {
            throw Error('error picking up', err)
        }
    }

    loadRoom = (id,exits) => {
        if (id in this.grid) {
            return this.grid[id];
        }

        this.grid[id] = {};

        exits.forEach(way => {
            this.grid[id][way] = '?';
        })
    }

    updateRooms = (firstID,way,nextID) => {
        const flipped = this.flipWay(way);
        this.grid[nextID][flipped] = firstID;
        this.grid[firstID][way] = nextID;
        return [this.grid[firstID],this.grid[nextID]]
    }

    flipWay = (way) => {
        const waze = {'n' : 's', 's': 'n', 'e' : 'w', 'w' : 'e'};
        return waze[way];
    }

    unexplore = (id) => {
        if (!(id in this.grid)) {
            return null;
        }
        // for (let [way,r_id] of Object.entries(this.grid[id])) {
        //     console.log(`${way}`);
        //     console.log(r_id);
        //     // unexplored = Object.entries(waze).filter(w => waze[w] == '?');
        // }
        // console.log(this.grid[id]);
        // Object.entries(this.grid[id]).forEach(w => console.log(this.grid[id][w[0]]));

        const unexplored = Object.entries(this.grid[id]).filter(w => this.grid[id][w[0]] == '?');
        
        if (!unexplored.length) {
            return null;
        }

        // const unexplored = Object.fromEntries(entries);
        // console.log(unexplored);

        const random_way = _.sample(unexplored);
        console.log('random_way', random_way);
        return random_way[0];
    }

}

module.exports = IslandMap;



// async function wrapper() {

//     i = new IslandMap()
//     i.load_grid('island-map.json');
//     const start = await i.currentRoom();
//     i.loadRoom(start.room_id);
//     console.log(i.grid[start.room_id]);
//     const trail = i.bfs(start.room_id);
//     const back = await i.backtrack(trail);
//     i.output('test.json',i.grid);
//     console.log(start,trail,back);
// }

// wrapper();






