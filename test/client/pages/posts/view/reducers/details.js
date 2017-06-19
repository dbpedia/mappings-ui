'use strict';
const Code = require('code');
const Constants = require('../../../../../../client/pages/posts/view/constants');
const Lab = require('lab');
const Store = require('../../../../../../client/pages/posts/view/store');


const lab = exports.lab = Lab.script();


lab.experiment('Posts View Details Reducer', () => {

    lab.test('it handles a GET_DETAILS action', (done) => {

        Store.dispatch({
            type: Constants.GET_DETAILS
        });

        const state = Store.getState().details;

        Code.expect(state.loading).to.be.true();
        Code.expect(state.hydrated).to.be.false();

        done();
    });


    lab.test('it handles a GET_DETAILS_RESPONSE action (success)', (done) => {

        Store.dispatch({
            type: Constants.GET_DETAILS_RESPONSE,
            err: null,
            response: {
                title: 'Test',
                postId: 'test'
            }
        });

        const state = Store.getState().details;

        Code.expect(state.loading).to.be.false();
        Code.expect(state.hydrated).to.be.true();

        done();
    });


    lab.test('it handles a GET_DETAILS_RESPONSE action (error)', (done) => {

        Store.dispatch({
            type: Constants.GET_DETAILS_RESPONSE,
            err: new Error('sorry pal'),
            response: {
                message: 'something else failed'
            }
        });

        const state = Store.getState().details;

        Code.expect(state.loading).to.be.false();
        Code.expect(state.showFetchFailure).to.be.true();
        Code.expect(state.error).to.equal('something else failed');

        done();
    });



});
