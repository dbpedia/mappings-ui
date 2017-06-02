'use strict';

const NotFound = require('./not-found.jsx');
const React = require('react');
const ReactRouter = require('react-router-dom');


const AccountProfile = require('./details/index.jsx');

const Route = ReactRouter.Route;
const Router = ReactRouter.BrowserRouter;
const Switch = ReactRouter.Switch;


const App = (
    <Router>
        <div>
            <Switch>
                <Route exact path="/profile" component={AccountProfile} />
                <Route component={NotFound} />
            </Switch>
        </div>
    </Router>
);


module.exports = App;
