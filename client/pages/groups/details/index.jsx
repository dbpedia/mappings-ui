'use strict';
const Actions = require('./actions');
const DetailsForm = require('./details-form.jsx');
const PermissionsForm = require('./permissions-form.jsx');
const ButtonGroup = require('../../../components/button-group.jsx');

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

        Actions.getDetails(this.props.match.params.id);

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


    remove(id) {

        window.confirm('Are you sure? This action cannot be undone.') && Actions.delete(id,this.props.history);
    }
    render() {

        if (!this.state.details.hydrated) {
            return (
                <section className="container">
                    <h1 className="page-header">
                        <Link to="/groups">Groups</Link> / loading...
                    </h1>
                </section>
            );
        }

        if (this.state.details.showFetchFailure) {
            return (
                <section className="container">
                    <h1 className="page-header">
                        <Link to="/groups">Groups</Link> / Error
                    </h1>
                    <div className="alert alert-danger">
                        {this.state.details.error}
                    </div>
                </section>
            );
        }

        const id = this.state.details._id;
        const name = this.state.details.name;

        const buttons = [

            {
                type: 'btn-danger',
                text: 'Delete permanently',
                action:this.remove.bind(this, id),
                disabled: (this.state.details._id === '111111111111111111111111' || this.state.details._id === '000000000000000000000000')

            }
        ];

        return (
            <section className="container">
                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}/>
                    <h1 >

                        <Link to="/groups">Groups</Link> / {name}

                    </h1>
                </div>

                <div className="row">
                    <div className="col-sm-7">
                        <DetailsForm {...this.state.details} />
                        <PermissionsForm {...this.state.permissions} />

                    </div>
                    <div className="col-sm-5">
                        <h3 className="text-center"><i className="fa fa-info-circle fa-2x"></i></h3>
                        <p className="lead">

                            <br/>
                            Groups are set of permissions identified by a name.<br/><br/>
                            Use groups to give a group of users a set of permissions you consider that must be together.
                            For specific individual permissions, please edit the specific account's permissions.
                        </p>
                    </div>
                </div>
            </section>
        );
    }
}

DetailsPage.propTypes = propTypes;


module.exports = DetailsPage;
