'use strict';
const MappingList = require('./list/index.jsx');
const MappingEdit = require('./edit/index.jsx');
const MappingView = require('./view/index.jsx');
const HistoryIndividualList = require('./history-individual-list/index.jsx');
const HistoryView = require('./history-view/index.jsx');
const HistoryDeletedList = require('./history-deleted-list/index.jsx');
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
        //const canList = UserUtilities.hasPermission(credentials,'can-list-posts');
        return (
            <Router>
                <div>
                    <Switch>
                        <Route exact path="/mappings" render={(props) => <MappingList user={credentials} {...props} />} />
                        <Route exact path="/mappings/edit/:template/:lang" render={(props) => <MappingEdit user={credentials} {...props} />} />
                        <Route exact path="/mappings/view/:template/:lang" render={(props) => <MappingView user={credentials} {...props} />} />
                        <Route exact path="/mappings/history/:template/:lang" render={(props) => <HistoryIndividualList user={credentials} {...props} />} />
                        <Route exact path="/mappings/history/view/:template/:lang/:version" render={(props) => <HistoryView user={credentials} {...props} />} />
                        <Route exact path="/mappings/history/deleted" render={(props) => <HistoryDeletedList user={credentials} {...props} />} />
                        <Route component={NotFound} />
                    </Switch>
                </div>
            </Router>
        );
    }
}
module.exports = App;
