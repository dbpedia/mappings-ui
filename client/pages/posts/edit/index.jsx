'use strict';
const Actions = require('./actions');
const DetailsForm = require('./details-form.jsx');
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


class EditPage extends React.Component {
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
        const path = `/posts/edit/${this.state.details.postId}`;
        this.changeShownURL(path);

    }


    changeShownURL(newPath){

        if (this.props.history){
            this.props.history.replace(newPath);
        }
    }

    //Go to the view
    cancelEditing(){

        this.props.history.push(`/posts/view/${this.state.details.postId}`);

    }


    remove(postId) {

        window.confirm('Are you sure? This action cannot be undone.') && Actions.delete(postId,this.props.history);
    }


    render() {

        if (!this.state.details.hydrated) {
            return (
                <section className="container">
                    <h1 className="page-header">
                        <Link to="/posts">Posts</Link> / loading...
                    </h1>
                </section>
            );
        }

        if (this.state.details.showFetchFailure) {
            return (
                <section className="container">
                    <h1 className="page-header">
                        <Link to="/posts">Posts</Link> / Error
                    </h1>
                    <div className="alert alert-danger">
                        {this.state.details.error}
                    </div>
                </section>
            );
        }

        const postId = this.state.details.postId;
        const title = this.state.details.title;

        const buttons = [
            {
                type: 'btn-warning',
                text: 'Cancel',
                action:this.cancelEditing.bind(this)

            },
            {
                type: 'btn-danger',
                text: 'Delete permanently',
                action:this.remove.bind(this, postId)

            }

        ];

        return (
            <section className="container">
                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}/>
                    <h1 >

                        <Link to="/posts">Posts</Link> / {title}

                    </h1>
                </div>

                <div className="row">
                    <div className="col-sm-8">
                        <DetailsForm {...this.state.details} />

                    </div>
                    <div className="col-sm-4">
                        <h3 className="text-center"><i className="fa fa-info-circle fa-2x"></i></h3>
                        <p className="lead">

                            <br/>
                            Edit the post using the Markdown language.<br/><br/>

                        </p>
                    </div>
                </div>
            </section>
        );
    }
}

EditPage.propTypes = propTypes;


module.exports = EditPage;
