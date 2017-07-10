'use strict';
const App = require('../../../../client/pages/mappings/app.jsx');
const Code = require('code');
const Lab = require('lab');


const lab = exports.lab = Lab.script();


lab.experiment('Mappings App', () => {

    lab.test('it loads', (done) => {

        Code.expect(App).to.exist();

        done();
    });
});
