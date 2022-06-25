'use strict';

class Queue {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.count = 0;
        this.waiting = [];
        this.onProcess = null;
        this.onDone = null;
        this.onSuccess = null;
        this.onFailure = null;
        this.onDrain = null;
        this.paused = true;
    }

    static channels(concurrency) {
        return new Queue(concurrency);
    }

    add(task) {
        if (this.paused) {
            this.waiting.push(task);
            return;
        }

        const hasChannel = this.count < this.concurrency;
        if (hasChannel) {
            this.next(task);
        }
    }

    next(task) {
        if(this.paused) {
            this.waiting.unshift(task);
            return;
        }

        this.count++;
        this.onProcess(task, (err, result) => {
            if (err) {
                if (this.onFailure) this.onFailure(err);
            } else if (this.onSuccess) {
                this.onSuccess(result);
            }
            if (this.onDone) this.onDone(err, result);
            this.count--;
            if (this.waiting.length > 0) {
                const task = this.waiting.shift();
                this.next(task);
                return;
            }
            if (this.count === 0 && this.onDrain) {
                this.onDrain();
            }
        });
    }

    takeNext() {
        const task = this.waiting.shift();
        const hasChannel = this.count < this.concurrency;
        if (hasChannel) this.next(task);
    }

    pause() {
        this.paused = true;
        return this;
    }

    resume() {
        this.paused = false;

        if (this.waiting.length > 0) {
            const channels = this.concurrency - this.count;
            for (let i = 0; i < channels; i++) {
                this.takeNext();
            }
        }

        return this;
    }

    process(listener) {
        this.onProcess = listener;
        return this;
    }

    done(listener) {
        this.onDone = listener;
        return this;
    }

    success(listener) {
        this.onSuccess = listener;
        return this;
    }

    failure(listener) {
        this.onFailure = listener;
        return this;
    }

    drain(listener) {
        this.onDrain = listener;
        return this;
    }
}

module.exports = Queue;
