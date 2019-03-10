'use strict';
const PostSearch = require('./admin-list/index.jsx');
const PublicPostList = require('./public-list/index.jsx');
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
        const canList = UserUtilities.hasPermission(credentials,'can-list-posts');
        return (
            <Router>
                <div>
                    <Switch>
                        <Route exact path="/" render={(props) => <PostView user={credentials} postId="home" {...props} />} />
                        {canList && <Route exact path="/posts" render={(props) => <PostSearch user={credentials} {...props} />} />}
                        {!canList && <Route exact path="/posts" render={(props) => <PublicPostList user={credentials} {...props} />} />}
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
