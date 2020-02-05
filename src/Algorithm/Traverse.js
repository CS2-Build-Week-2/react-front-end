require('dotenv').config();
const axiosAuth = require('../utils/axiosAuth');
const token = process.env.API_KEY;
console.log('token', token);
// const os = require('os');
// const fs = require('fs-extra');


class Traverse {
    constructor() {
        this.graph = {}
    }

    start = async () => {
        try {
            const res =  await axiosAuth(token).get('/init');
            const room = res.data;
            // console.log('room', room);
            this.graph[room.room_id] = [room.cooldown,...room.exits];
            console.log('graph', this.graph);
            // fs.writeFile('./rooms.json',this.graph[room.room_id], err => {if (err) throw err})
            // const stream = fs.createWriteStream("./rooms.js", {flags : 'a'});
            // stream.write(this.graph[room.room_id], err => {if (err) throw err})
            return [room.cooldown, room.exits]
        } catch(err) {
            console.log(err.response.data.detail);
        }
    }

    explore = async (way) => {
        try {
            const res = await axiosAuth(token).post('/move',{direction : way})
            const room = res.data;
            this.graph[room.room_id] = [room.cooldown,...room.exits];
            // const stream = fs.createWriteStream("./rooms.js", {flags : 'a'});
            // stream.write(this.graph[room.room_id], err => {if (err) throw err})
            // console.log('graph', this.graph);
            fs.writeFile('./rooms.json',this.graph, err => {if (err) throw err })
            // stream.end()
            
            return [room.cooldown, room.exits]
        } catch(err) {
            console.log(err.response.data);
        }
    }
}

const t = new Traverse()

const begin = async () => {
        const [cooldown,exits] = await t.start();
        const rand = Math.floor(Math.random()*exits.length);
        return [cooldown,exits[rand]]
}

const traverse = ([cooldown,way]) => {
    console.log('cooldown','way',cooldown,way);
    const promise = new Promise((resolve,reject) => {
        setTimeout(async () => {
            const [cool,exits] = await t.explore(way)
            const rand = Math.floor(Math.random()*exits.length);
            resolve([cool,exits[rand]])
        },cooldown*1000)
    })

    return promise;
}

async function wrap() {
    let coolexit = await begin();
    // const coolexit2 = await traverse(coolexit1)
    for (let i=0; i<10; i++) {
       const nextCE = await traverse(coolexit);
       coolexit = nextCE;
    }
}
wrap();







