'use strict';

const GroupDetails = require('./details/index.jsx');
const GroupSearch = require('./search/index.jsx');
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
                <Route exact path="/groups" component={GroupSearch} />
                <Route exact path="/groups/:id" component={GroupDetails} />
                <Route component={NotFound} />
            </Switch>
        </div>
    </Router>
);


module.exports = App;
