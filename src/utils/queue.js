const LinkedList = require('../utils/linkedlist');

class Queue {
    constructor() {
        // this.queue = new LinkedList(data);
        this.queue = [];
    }

    enque(val) {
        // return this.queue.attach(val);
        this.queue.push(val);
        return this.queue[this.queue.length - 1]
    }

    deque() {
        // console.log(this.queue.behead());
        return this.queue.shift()
        // return this.queue.behead();
    }

    size() {
        // return this.queue.linkedlist.length;
        return this.queue.length;
    }
}

module.exports = Queue;


// q = new Queue(10);
// q.enque(20);
// q.enque(30);
// q.enque(40);
// console.log(q);
// q.deque();
// q.deque();
// console.log(q);
// x = q.size();
// console.log(x);

