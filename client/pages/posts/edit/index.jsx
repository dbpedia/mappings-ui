'use strict';
const Actions = require('./actions');
const DetailsForm = require('./details-form.jsx');
const ButtonGroup = require('../../../components/button-group.jsx');
const UserUtilities = require('../../../helpers/user-utilities');
const Moment = require('moment');
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Store = require('./store');

const Link = ReactRouter.Link;
const propTypes = {
    history: PropTypes.object,
    match: PropTypes.object,
    user: PropTypes.object
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

        window.confirm('Are you sure? All unsaved changes will be lost.') &&
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
                action:this.remove.bind(this, postId),
                disabled: !UserUtilities.hasPermission(this.props.user,'can-remove-posts') || this.state.details.postId === 'home'

            }

        ];

        if (title) {
            document.title = 'Editing post "' + title + '" | DBpedia Mappings UI';
        }

        return (
            <section className="container">
                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}/>
                    <h1 >

                        <Link to="/posts">Posts</Link> / <Link to={'/posts/view/' + this.state.details.postId}>{title}</Link>
                    </h1>
                    {this.state.details.hydrated && <span>Last edited on { Moment(this.state.details.lastEdition.time).format('DD/MM/YYYY, HH:mm:ss') } by { this.state.details.lastEdition.username}</span>}

                </div>

                <div className="row">
                    <div className="col-sm-8">


                        <DetailsForm {...this.state.details}/>


                    </div>
                    <div className="col-sm-4">
                        <h3 className="text-center"><i className="fa fa-info-circle fa-2x"></i></h3>
                        <p className="lead-little">

                            <br/>
                            Edit the post using the <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet">Markdown language</a> and/or HTML. You can preview it clicking on the "Preview" tab without having to save.<br/>
                            <br/>When done, click "Save Changes", or click "Cancel" to discard your current changes.
                            <br/>

                        </p>
                    </div>
                </div>
            </section>
        );
    }
}

EditPage.propTypes = propTypes;


module.exports = EditPage;
