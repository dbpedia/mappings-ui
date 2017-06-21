'use strict';
const AccountDetails = require('./details/index.jsx');
const AccountSearch = require('./search/index.jsx');
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
                        <Route exact path="/accounts" render={(props) => <AccountSearch user={credentials} {...props} />} />
                        <Route exact path="/accounts/:id" render={(props) => <AccountDetails user={credentials} {...props} />} />
                        <Route component={NotFound} />
                    </Switch>
                </div>
            </Router>

        );

    }

}




module.exports = App;
