'use strict';

const clone = data => JSON.parse(JSON.stringify(data));

class State {
    constructor(data) {
        this.data = data;
        this.history = [];
    }

    static init(iniState) {
        return new State(iniState);
    }

    setState = (newState) => {
        this.history.push(clone(this.data));
        let data = newState instanceof Function
            ? newState(this.data)
            : newState;

        this.data = clone(data);
    }

    getState = () => {
        return new Proxy(this.data, {
            get: (target, prop) => {
                return target[prop]
            },

            set(target, p, value, receiver) {
                console.error('Error. Try change state');
            }
        });
    }
}

module.exports = State;
