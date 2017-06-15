/* eslint-disable hapi/hapi-scope-start */
'use strict';
const Actions = require('./actions');
const DetailsForm = require('./details-form.jsx');
const PasswordForm = require('./password-form.jsx');
const StatsForm = require('../../../components/stats-form.jsx');
const ButtonGroup = require('../../../components/button-group.jsx');
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
                        <Link to="/accounts">Accounts</Link> / loading...
                    </h1>
                </section>
            );
        }

        if (this.state.details.showFetchFailure) {
            return (
                <section className="section-account-details container">
                    <h1 className="page-header">
                        <Link to="/accounts">Accounts</Link> / Error
                    </h1>
                    <div className="alert alert-danger">
                        {this.state.details.error}
                    </div>
                </section>
            );
        }

        const id = this.state.details._id;
        const name = this.state.details.name;
        let fullName = name.first;
        if (name.last && name.last.length > 0) {
            fullName += ' ' + name.last;
        }




        const buttons = [

            { type: 'btn-danger', text: 'Delete permanently', action:
                () => {
                    window.confirm('Are you sure? This action cannot be undone.') && Actions.delete(id,this.props.history);
                }
            }
        ];

        if ( this.state.details.isActive ){
            buttons.unshift( { type: 'btn-warning', text: 'Disable', loading: this.state.details.activeChangeLoading, action:
                () => {
                    Actions.changeActive(id, { isActive:false } );
                }
            });
        }
        else {
            buttons.unshift( { type: 'btn-success', text: 'Enable', loading: this.state.details.activeChangeLoading, action:
                () => {
                    Actions.changeActive(id, { isActive:true } );
                }
            });
        }

        return (
            <section className="section-account-details container">
                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}/>
                    <h1 >

                        <Link to="/accounts">Accounts</Link> / {fullName}
                        {!this.state.details.isActive &&

                        <span style={ { 'fontSize':'0.7em' }}><i>&nbsp;(Disabled)</i></span>}

                    </h1>
                </div>
                <div className="row">
                    <div className="col-sm-6">
                        <DetailsForm {...this.state.details} />
                    </div>
                    <div className="col-sm-6">
                        <StatsForm {...this.state.details} />
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

            </section>
        );
    }
}

DetailsPage.propTypes = propTypes;


module.exports = DetailsPage;
