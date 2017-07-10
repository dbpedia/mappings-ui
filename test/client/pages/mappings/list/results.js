'use strict';
const Code = require('code');
const Lab = require('lab');
const React = require('react');
const ReactRouter = require('react-router-dom');
const ReactTestUtils = require('react-dom/test-utils');
const Results = require('../../../../../client/pages/mappings/list/results.jsx');


const lab = exports.lab = Lab.script();
const MemoryRouter = ReactRouter.MemoryRouter;


lab.experiment('Mappings Search Results', () => {

    lab.test('it renders with and without data', (done) => {

        const props = {
            data: [{
                _id: {
                    template: 'writer',
                    lang: 'es'
                },
                templateFullName: 'writer',
                status: 'OK'
            }, {
                _id: {
                    template: 'writer2',
                    lang: 'es'
                },
                templateFullName: 'writer2',
                status: 'OK'
            }]
        };
        const ResultsEl = React.createElement(Results, props);
        const RootEl = React.createElement(MemoryRouter, {}, ResultsEl);
        const root = ReactTestUtils.renderIntoDocument(RootEl);
        const results = ReactTestUtils.findRenderedComponentWithType(root, Results);

        Code.expect(results).to.exist();

        done();
    });
});
