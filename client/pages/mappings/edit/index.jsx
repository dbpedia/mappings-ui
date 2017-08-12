'use strict';
const Actions = require('./actions');
const DetailsForm = require('./details-form.jsx');
const ButtonGroup = require('../../../components/button-group.jsx');
const UserUtilities = require('../../../helpers/user-utilities');
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Store = require('./store');
const MappingTesterPanel = require('../../../components/mappingTesterPanel.jsx');
const OntologySearchPanel = require('../../../components/ontologySearchPanel.jsx');
const AddTemplatePanel = require('./addTemplatePanel.jsx');
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



    //Called when new template has been added
    onTemplateAdded(childType,content){


        const dump = this.refs.details.getCurrentText();
        const templatePanel = this.refs.templatePanel;
        Actions.getRMLfromTemplate(this.props.match.params.template,this.props.match.params.lang,dump,childType,content,this.refs.details,templatePanel);

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

    goToHistory(){

        window.confirm('Are you sure? Unsaved content will be lost.') && this.props.history.push('/mappings/history/' + this.state.details._id.template + '/' + this.state.details._id.lang);
    }


    remove(template,lang) {

        window.confirm('Are you sure? This action cannot be undone.') && Actions.delete(template,lang,this.props.history);
    }

    onEditorChange(text){
        const details = { ...this.state.details };
        details.rml = text;
        this.setState({ details });
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
                action:this.remove.bind(this, title,lang),
                disabled: !UserUtilities.hasPermission(this.props.user,'can-remove-mappings')

            }

        ];

        const buttonRestore = [

            {
                type: 'btn-default',
                text: <span><i className="fa fa-history" aria-hidden="true"></i>&nbsp;View old versions</span>,
                action: this.goToHistory.bind(this),
                disabled: false

            }

        ];

        return (
            <section className="container">

                <div className="page-header">

                    <ButtonGroup float='right' buttons={buttons}/>
                    <span style={{ float: 'right' }}>&nbsp;</span>
                    <ButtonGroup float='right' buttons={buttonRestore}/>
                    <h2 >

                        Editing <Link to={'/mappings?lang=' + this.getUserLanguage()}>Mappings</Link> / <Link to={'/mappings/view/' + this.state.details._id.template + '/' + lang}>{title + ' / ' + lang}</Link>
                    </h2>

                </div>

                <div className="row">
                    <div className="col-sm-8">



                        <DetailsForm ref="details" {...this.state.details} onChange={this.onEditorChange.bind(this)}/>


                    </div>
                    <div className="col-sm-4">


                        <AddTemplatePanel ref="templatePanel" onTemplateFinish={this.onTemplateAdded.bind(this)} {...this.state.template}/>
                        <MappingTesterPanel
                            {...this.state.test}
                            lang={this.state.details._id.lang}
                            template={this.state.details._id.template}
                            rml={this.state.details.rml}
                            action={Actions.extractTriples.bind(this)}
                        />
                    </div>
                </div>
            </section>
        );
    }
}

EditPage.propTypes = propTypes;


module.exports = EditPage;
