'use strict';
const Actions = require('./actions');
const DetailsForm = require('./details-form.jsx');
const PasswordForm = require('./password-form.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Store = require('./store');



const Link = ReactRouter.Link;
const propTypes = {
    history: PropTypes.object,
    match: PropTypes.object
};


class DetailsPage extends React.Component {
    constructor(props) {

        super(props);

        Actions.getDetails(); //Get profile details from backend
        //Actions.getStatusOptions(); //Get status from backend
        //Actions.getGroupOptions();  //Get groups from backend


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

        const name = this.state.details.name;
        const fullName = `${name.first} ${name.last}`;

        return (
            <section className="section-account-details container">
                <h1 className="page-header">
                    My Account ({fullName})
                </h1>
                <div className="row">
                    <div className="col-sm-6">
                        <DetailsForm {...this.state.details} />
                    </div>
                    <div className="col-sm-6">
                        <PasswordForm {...this.state.password} />
                    </div>
                </div>

            </section>
        );
    }
}

DetailsPage.propTypes = propTypes;


module.exports = DetailsPage;
