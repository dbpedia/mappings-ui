'use strict';
const Actions = require('./actions');
const DetailsForm = require('./details-form.jsx');
const ButtonGroup = require('../../../components/button-group.jsx');
const Moment = require('moment');
const PropTypes = require('prop-types');
const React = require('react');
const Store = require('./store');


const propTypes = {
    history: PropTypes.object,
    match: PropTypes.object
};


class ViewPage extends React.Component {
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

        const buttons = [
            {
                type: 'btn-success',
                text: 'Edit',
                action: this.goToEdition.bind(this)

            }

        ];

        return (
            <section className="container">
                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}/>

                    <h1 >

                        {title}

                    </h1>
                    Last edited on { Moment(this.state.details.lastEdition.time).format('DD/MM/YYYY, HH:mm:ss') } by { this.state.details.lastEdition.username}
                </div>

                <div className="row">
                    <div className="col-sm-8">
                        <DetailsForm {...this.state.details} />

                    </div>

                </div>
            </section>
        );
    }
}

ViewPage.propTypes = propTypes;


module.exports = ViewPage;
