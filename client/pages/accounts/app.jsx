'use strict';
const AccountDetails = require('./details/index.jsx');
const AccountSearch = require('./search/index.jsx');
const NotFound = require('./not-found.jsx');
const React = require('react');
const ReactRouter = require('react-router-dom');


const Router = ReactRouter.BrowserRouter;
const Route = ReactRouter.Route;
const Switch = ReactRouter.Switch;


const App = (
    <Router>
        <div>
            <Switch>
                <Route exact path="/accounts" component={AccountSearch} />
                <Route exact path="/accounts/:id" component={AccountDetails} />
                <Route component={NotFound} />
            </Switch>
        </div>
    </Router>
);


module.exports = App;
