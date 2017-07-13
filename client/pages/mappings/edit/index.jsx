'use strict';
const Actions = require('./actions');
const DetailsForm = require('./details-form.jsx');
const ButtonGroup = require('../../../components/button-group.jsx');
//const UserUtilities = require('../../../helpers/user-utilities');
const Moment = require('moment');
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Store = require('./store');
const MappingTesterPanel = require('../../../components/mappingTesterPanel.jsx');
const OntologySearchPanel = require('../../../components/ontologySearchPanel.jsx');
const Link = ReactRouter.Link;
const propTypes = {
    history: PropTypes.object,
    match: PropTypes.object,
    user: PropTypes.object
};


class EditPage extends React.Component {
    constructor(props) {

        super(props);

        Actions.getDetails(this.props.match.params.template,this.props.match.params.lang);

        this.state = Store.getState();


    }

    componentDidMount() {

        this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));
        this.setState({
            language: this.props.user && this.props.user.mappingsLang,
            isAuthenticated: this.props.user
        });



    }

    getUserLanguage(){

        if (this.state.isAuthenticated){
            if (!this.state.language){
                return '';
            }
            return this.state.language;
        }

        return 'en';

    }

    componentWillUnmount() {

        this.unsubscribeStore();
    }

    onStoreChange() {


        this.setState(Store.getState());

    }

    //Introduce value in editor
    onOntologySearchSubmit(value){

        this.refs.details.insertTextAtCursor(value);
    }

    changeShownURL(newPath){

        if (this.props.history){
            this.props.history.replace(newPath);
        }
    }

    //Go to the view
    cancelEditing(){

        window.confirm('Are you sure? All unsaved changes will be lost.') &&
        this.props.history.push(`/mappings/view/${this.state.details._id.template}/${this.state.details._id.lang}`);

    }




    remove(template,lang) {

        window.confirm('Are you sure? This action cannot be undone.') && Actions.delete(template,lang,this.props.history);
    }


    render() {

        if (!this.state.details.hydrated) {
            return (
                <section className="container">
                    <h1 className="page-header">
                        <Link to="/mappings">Mappings</Link> / loading...
                    </h1>

                </section>
            );
        }

        if (this.state.details.showFetchFailure) {
            return (
                <section className="container">
                    <h1 className="page-header">
                        <Link to="/mappings">Mappings</Link> / Error
                    </h1>
                    <div className="alert alert-danger">
                        {this.state.details.error}
                    </div>
                </section>
            );
        }

        const title = this.state.details._id.template;
        const lang = this.state.details._id.lang;

        const buttons = [
            {
                type: 'btn-warning',
                text: 'Cancel',
                action:this.cancelEditing.bind(this)

            },
            {
                type: 'btn-danger',
                text: 'Delete',
                action:this.remove.bind(this, title,lang)

            }

        ];

        return (
            <section className="container">
                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}/>
                    <h1 >

                        <Link to={'/mappings?lang=' + this.getUserLanguage()}>Mappings</Link> / <Link to={'/mappings/view/' + this.state.details._id.template + '/' + lang}>{title}</Link>
                    </h1>
                    {this.state.details.hydrated && <span>Last edited on { Moment(this.state.details.edition.date).format('DD/MM/YYYY, HH:mm:ss') } by { this.state.details.edition.username}</span>}
                    {this.state.details.hydrated && <span><br/>Edition comment: {this.state.details.oldComment}</span>}
                    {this.state.details.edition.comment}
                </div>

                <div className="row">
                    <div className="col-sm-8">


                        <DetailsForm ref="details" {...this.state.details}/>


                    </div>
                    <div className="col-sm-4">
                        <OntologySearchPanel onSubmit={this.onOntologySearchSubmit.bind(this)}/>
                        <MappingTesterPanel/>
                    </div>
                </div>
            </section>
        );
    }
}

EditPage.propTypes = propTypes;


module.exports = EditPage;
