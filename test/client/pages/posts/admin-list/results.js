'use strict';
const Code = require('code');
const Lab = require('lab');
const React = require('react');
const ReactRouter = require('react-router-dom');
const ReactTestUtils = require('react-dom/test-utils');
const Results = require('../../../../../client/pages/posts/admin-list/results.jsx');


const lab = exports.lab = Lab.script();
const MemoryRouter = ReactRouter.MemoryRouter;


lab.experiment('Post Search Results', () => {

    lab.test('it renders with and without data', (done) => {

        const props = {
            data: [{
                _id: 'id',
                title: 'Title',
                creation: {
                    username: 'admin',
                    time: new Date()
                },
                lastEdition: {
                    username: 'admin',
                    time: new Date()
                }
            }, {
                _id: 'id2',
                title: 'Title',
                creation: {
                    username: 'admin',
                    time: new Date()
                },
                lastEdition: {
                    username: 'admin',
                    time: new Date()
                }
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
