'use strict';
const Code = require('code');
const FluxConstant = require('flux-constant');
const Lab = require('lab');
const Proxyquire = require('proxyquire');


const lab = exports.lab = Lab.script();
const stub = {
    ApiActions: {
        get: function () {

            stub.ApiActions.get.mock.apply(null, arguments);
        },
        put: function () {

            stub.ApiActions.put.mock.apply(null, arguments);
        },
        delete: function () {

            stub.ApiActions.delete.mock.apply(null, arguments);
        }
    },
    Store: {

        dispatch: function () {

            stub.Store.dispatch.mock.apply(null, arguments);
        }
    }
};
const Actions = Proxyquire('../../../../../client/pages/posts/view/actions', {
    '../../../actions/api': stub.ApiActions,
    './store': stub.Store
});


lab.experiment('Post View Details Actions', () => {

    lab.test('it calls ApiActions.get from getDetails', (done) => {

        stub.ApiActions.get.mock = function (url, data, store, typeReq, typeRes, callback) {

            Code.expect(url).to.be.a.string();
            Code.expect(url).to.include('abcxyz');
            Code.expect(data).to.be.undefined();
            Code.expect(store).to.be.an.object();
            Code.expect(typeReq).to.be.an.instanceof(FluxConstant);
            Code.expect(typeRes).to.be.an.instanceof(FluxConstant);
            Code.expect(callback).to.not.exist();

            done();
        };

        Actions.getDetails('abcxyz');
    });



});
