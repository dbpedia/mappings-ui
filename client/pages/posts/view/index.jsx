'use strict';
const Actions = require('./actions');
const DetailsForm = require('./details-form.jsx');
const ButtonGroup = require('../../../components/button-group.jsx');
const UserUtilities = require('../../../helpers/user-utilities');

const Moment = require('moment');
const PropTypes = require('prop-types');
const React = require('react');
const Store = require('./store');

const propTypes = {
    history: PropTypes.object,
    match: PropTypes.object,
    user: PropTypes.object,
    postId: PropTypes.string
};

class ViewPage extends React.Component {
    constructor(props) {
        super(props);
        //postId property only used when not match param
        if (this.props.match.params.id){
            Actions.getDetails(this.props.match.params.id);
        }
        else {
            Actions.getDetails(this.props.postId);
        }
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

    goToEdition(){
        this.props.history.push('/posts/edit/' + this.state.details.postId);
    }

    render() {
        if (!this.state.details.hydrated) {
            return (
                <section className="container">
                    <h1 className="page-header">
                        Loading...
                    </h1>
                </section>
            );
        }

        if (this.state.details.showFetchFailure) {
            return (
                <section className="container">
                    <h1 className="page-header">
                        Error
                    </h1>
                    <div className="alert alert-danger">
                        {this.state.details.error}
                    </div>
                </section>
            );
        }

        //const postId = this.state.details.postId;
        const title = this.state.details.title;

        const buttons = [];
        if (UserUtilities.hasPermission(this.props.user,'can-edit-posts')){
            buttons.push({
                type: 'btn-default',
                text: <span><i className="fa fa-pencil" aria-hidden="true"></i>&nbsp;Edit</span>,
                action: this.goToEdition.bind(this)
            });
        };

        if (title) {
            document.title =  title + ' | DBpedia Mappings UI';
        }

        return (
            <section className="container">
                {this.props.postId !== 'home' &&
                 <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}/>
                    <h1>
                        {title}
                    </h1>
                </div>
                }

                <div className={'row' + (this.props.postId === 'home' ? ' home-row' : '')}>
                    <div className="col-sm-12">
                        {this.props.postId === 'home' && <ButtonGroup float='right' buttons={buttons}/>}

                        <DetailsForm {...this.state.details} />

                    </div>

                </div>
                <br/>---<br/><i>Last edited on { Moment(this.state.details.lastEdition.time).format('DD/MM/YYYY, HH:mm:ss') } by { this.state.details.lastEdition.username}</i>
            </section>
        );
    }
}
ViewPage.propTypes = propTypes;
module.exports = ViewPage;
