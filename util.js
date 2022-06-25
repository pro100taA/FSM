const Queue = require("./queue");

const createQueue = (step, parallel = true) => {
    const {children} = step;

    if(!children?.length) {
        return step;
    }

    const channels = parallel ? children.length : 1;

    return build(children, Queue.channels(channels));
}

const build = (steps, queue) => {
    for(const step of steps) {
        switch (step.type) {
            case 'parallel':
                if(!step.children) {
                    console.error("Error parallel.");
                }

                queue.add(createQueue(step));
                break;

            case 'if':
                const job = step.condition ? step.then : step.else;
                queue.add(createQueue(job, false));
                break;

            default:
                queue.add(createQueue(step, false));
        }
    }

    return queue;
}

const init = process => {
    return build(process.children, Queue.channels(1))
}

module.exports = init;
