'use strict';
const Code = require('code');
const Constants = require('../../../../../../client/pages/accounts/search/constants');
const Lab = require('lab');
const Store = require('../../../../../../client/pages/accounts/search/store');


const lab = exports.lab = Lab.script();


lab.experiment('Accounts Search Groups Reducer', () => {


    lab.test('it handles a GET_GROUP_OPTIONS action', (done) => {

        Store.dispatch(
            {
                type: Constants.GET_GROUP_OPTIONS
            }
        );

        const state = Store.getState().groups;

        Code.expect(state.loading).to.be.true();

        done();
    });


    lab.test('it handles a GET_GROUP_OPTIONS_RESPONSE action (only setting options if present)', (done) => {

        let state = Store.getState().groups;
        const originalOptionCount = state.options.length;

        Store.dispatch({
            type: Constants.GET_GROUP_OPTIONS_RESPONSE,
            err: null,
            response: {}
        });

        state = Store.getState().groups;

        Code.expect(state.options).to.have.length(originalOptionCount);

        Store.dispatch({
            type: Constants.GET_GROUP_OPTIONS_RESPONSE,
            err: null,
            response: {
                data: [{}]
            }
        });

        state = Store.getState().groups;

        Code.expect(state.options).to.have.length(1);

        done();
    });



});
