'use strict';
const Actions = require('./actions');
const DeleteForm = require('../../../../../client/pages/admin/components/delete-form.jsx');
const DetailsForm = require('./details-form.jsx');
const PasswordForm = require('./password-form.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Store = require('./store');
const GroupsForm = require('./groups-form.jsx');
const PermissionsForm = require('./permissions-form.jsx');



const Link = ReactRouter.Link;
const propTypes = {
    history: PropTypes.object,
    match: PropTypes.object
};


class DetailsPage extends React.Component {
    constructor(props) {

        super(props);

        Actions.getDetails(this.props.match.params.id); //Get profile details from backend
        Actions.getStatusOptions(); //Get status from backend
        Actions.getGroupOptions();  //Get groups from backend


        this.state = Store.getState();
    }

    componentDidMount() {

        this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));
    }

    componentWillUnmount() {

        this.unsubscribeStore();
    }

    onStoreChange() {

        this.setState(Store.getState());
    }

    render() {

        if (!this.state.details.hydrated) {
            return (
                <section className="section-account-details container">
                    <h1 className="page-header">
                        <Link to="/admin/accounts">Accounts</Link> / loading...
                    </h1>
                </section>
            );
        }

        if (this.state.details.showFetchFailure) {
            return (
                <section className="section-account-details container">
                    <h1 className="page-header">
                        <Link to="/admin/accounts">Accounts</Link> / Error
                    </h1>
                    <div className="alert alert-danger">
                        {this.state.details.error}
                    </div>
                </section>
            );
        }

        const id = this.state.details._id;
        const name = this.state.details.name;
        const fullName = `${name.first} ${name.last}`;

        return (
            <section className="section-account-details container">
                <h1 className="page-header">
                    <Link to="/admin/accounts">Accounts</Link> / {fullName}
                </h1>
                <div className="row">
                    <div className="col-sm-6">
                        <DetailsForm {...this.state.details} />
                    </div>
                    <div className="col-sm-6">
                        <PasswordForm {...this.state.password} />
                        {/*<NoteForm
                            {...this.state.note}
                            saveAction={Actions.newNote.bind(Actions, id)}
                            successCloseAction={Actions.hideNoteSaveSuccess}
                        />*/}
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-6">
                        <GroupsForm {...this.state.groups} />
                    </div>
                    <div className="col-sm-6">
                        <PermissionsForm {...this.state.permissions} />
                    </div>

                </div>
                <div className="row">
                    <DeleteForm
                        {...this.state.delete}
                        action={Actions.delete.bind(Actions, id, this.props.history)}
                    />
                </div>
            </section>
        );
    }
}

DetailsPage.propTypes = propTypes;


module.exports = DetailsPage;
