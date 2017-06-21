'use strict';
const PostSearch = require('./search/index.jsx');
const PostEdit = require('./edit/index.jsx');
const PostView = require('./view/index.jsx');
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
                        <Route exact path="/posts" render={(props) => <PostSearch user={credentials} {...props} />} />
                        <Route exact path="/posts/edit/:id" render={(props) => <PostEdit user={credentials} {...props} />} />
                        <Route exact path="/posts/view/:id" render={(props) => <PostView user={credentials} {...props} />} />
                        <Route component={NotFound} />
                    </Switch>
                </div>
            </Router>

        );

    }

}



module.exports = App;
