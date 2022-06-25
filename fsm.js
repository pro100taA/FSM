'use strict';

const init = require('./util');
const State = require('./state');
const Queue = require('./queue');

class FSM {
    constructor() {
        this.process = null;
        this.state = null;
    }

    job = async (task, next) => {
        if(task instanceof Queue) {
            task.process(this.job);
            task.drain(() => next(null, task));
            task.resume();
            return;
        }

        await task.run(this.state.getState(), this.state.setState);
        next(null, task);
    };

    run = (process) => new Promise((resolve) => {
        this.state = State.init({});
        this.process = init(process);
        this.process.process(this.job);
        this.process.drain(resolve);
        this.process.resume();
    });
}

module.exports = FSM;
