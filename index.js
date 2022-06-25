'use strict';

const FSM = require('./fsm');

const process = {
    type: 'successively',
    children: [
        {
            type: 'step',
            run: async (state) => console.log('step 1', state),
        },
        {
            type: 'step',
            run: async (state) => console.log('step 2', state),
        },
        {
            type: 'parallel',
            children: [
                {
                    type: 'step',
                    run: (state, setState) => new Promise(r => {
                        setTimeout(() => {
                            setState((state) => ({...state, r: "1"}));
                            console.log('step 3', state)
                            r();
                        }, 100)
                    }),
                },
                {
                    type: 'step',
                    run: (state, setState) => new Promise(r => {
                        setTimeout(() => {
                            setState((state) => ({...state, v: "1"}));
                            console.log('step 4', state)
                            r();
                        }, 300)
                    }),
                },
            ]
        },
        {
            type: 'step',
            run: async (state, setState) => {
                setState((state) => ({...state, f: "1"}));
                console.log('step 5', state)
            },
        },
        {
            type: 'if',
            condition: 2 > 5,
            then: {
                type: 'step',
                run: async (state) => console.log('step 6', state),
            },
            else: {
                type: 'step',
                run: async (state) => console.log('step 7', state),
            }
        },
    ]
};

const fsm = new FSM();
(async () => {
    await fsm.run(process);
    console.log(fsm);
})();
