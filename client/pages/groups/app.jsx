'use strict';

const GroupDetails = require('./details/index.jsx');
const GroupSearch = require('./search/index.jsx');
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
                        <Route exact path="/groups" render={(props) => <GroupSearch user={credentials} {...props} />} />
                        <Route exact path="/groups/:id" render={(props) => <GroupDetails user={credentials} {...props} />} />
                        <Route component={NotFound} />
                    </Switch>
                </div>
            </Router>

        );

    }

}





module.exports = App;
