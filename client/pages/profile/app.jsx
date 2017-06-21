'use strict';

const NotFound = require('./not-found.jsx');
const React = require('react');
const ReactRouter = require('react-router-dom');


const AccountProfile = require('./details/index.jsx');

const Route = ReactRouter.Route;
const Router = ReactRouter.BrowserRouter;
const Switch = ReactRouter.Switch;


const UserUtilities = require('../../helpers/user-utilities');



class App extends React.Component {




    render(){

        const credentials = UserUtilities.parseUserFromHTML();

        return (
            <Router>
                <div>
                    <Switch>
                        <Route exact path="/profile" render={(props) => <AccountProfile user={credentials} {...props} />} />
                        <Route component={NotFound} />
                    </Switch>
                </div>
            </Router>

        );

    }

}




module.exports = App;
