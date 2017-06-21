'use strict';
const Forgot = require('./forgot/index.jsx');
const Home = require('./home/index.jsx');
const Logout = require('./logout/index.jsx');
const NotFound = require('./not-found.jsx');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Reset = require('./reset/index.jsx');


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
                        <Route exact path="/login" render={(props) => <Home user={credentials} {...props} />} />
                        <Route exact path="/login/forgot" render={(props) => <Forgot user={credentials} {...props} />} />
                        <Route exact path="/login/reset/:email/:key" render={(props) => <Reset user={credentials} {...props} />} />
                        <Route exact path="/login/logout" render={(props) => <Logout user={credentials} {...props} />} />
                        <Route component={NotFound} />
                    </Switch>
                </div>
            </Router>

        );

    }

}





module.exports = App;
