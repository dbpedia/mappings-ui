'use strict';

const Home = require('./home.jsx');
const NotFound = require('./not-found.jsx');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Router = ReactRouter.BrowserRouter;
const Route = ReactRouter.Route;
const Switch = ReactRouter.Switch;
const UserUtilities = require('../../helpers/user-utilities');
class App extends React.Component {
    render(){
        const credentials = UserUtilities.parseUserFromHTML();
        return (
            <Router>
                <div>
                    <Switch>
                        <Route exact path="/adminpanel" render={(props) => <Home user={credentials} {...props} />} />
                        <Route component={NotFound} />
                    </Switch>
                </div>
            </Router>
        );
    }
}
module.exports = App;
