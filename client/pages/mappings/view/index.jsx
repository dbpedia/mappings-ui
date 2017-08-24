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
const MappingTester = require('../../../components/mappingTesterPanel.jsx');
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



    getPercentage(up,down){

        if (!up || !down){
            return 'N/A';
        }
        return (up * 100 / down).toFixed(2);
    }

    componentDidMount() {

        this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));
        this.setState({ 'wikiSearchValue':'',
            language: this.props.user && this.props.user.mappingsLang,
            isAuthenticated: this.props.user
        });
        document.title = 'Viewing ' + this.props.match.params.template + '/' + this.props.match.params.lang + ' | DBpedia Mappings UI';


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

    onWikiSearchChange(event,{ newValue }){

        this.setState({ 'wikiSearchValue':newValue });
    }

    changeShownURL(newPath){

        if (this.props.history){
            this.props.history.replace(newPath);
        }
    }

    goToEdition(){

        this.props.history.push('/mappings/edit/' + this.state.details._id.template + '/' + this.state.details._id.lang);
    }

    goToHistory(){

        this.props.history.push('/mappings/history/' + this.state.details._id.template + '/' + this.state.details._id.lang);
    }

    remove(template,lang) {

        window.confirm('Are you sure?') && Actions.delete(template,lang,this.props.history);
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
                type: 'btn-default',
                text: <span><i className="fa fa-history" aria-hidden="true"></i>&nbsp;View old versions</span>,
                action: this.goToHistory.bind(this),
                disabled: false

            },
            {
                type: 'btn-default',
                text: <span><i className="fa fa-pencil" aria-hidden="true"></i>&nbsp;Edit</span>,
                action: this.goToEdition.bind(this),
                disabled: !UserUtilities.hasPermission(this.props.user,'can-edit-mappings')

            }



        ];


        return (
            <section className="container">
                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}/>
                    <h2 >

                        Viewing <Link to={'/mappings?lang=' + this.getUserLanguage()}>Mappings</Link> / <Link to={'/mappings/view/' + this.state.details._id.template + '/' + lang}>{title + ' / ' + lang}</Link>
                    </h2>

                </div>

                <div className="row">
                    <div className="col-sm-8">


                        <DetailsForm {...this.state.details}/>
                        {this.state.details.hydrated && <span>Last edited on { Moment(this.state.details.edition.date).format('DD/MM/YYYY, HH:mm:ss') } by { this.state.details.edition.username}</span>}
                        {this.state.details.hydrated && <span><br/>Edition comment: {this.state.details.oldComment}</span>}
                        {this.state.details.edition.comment}

                    </div>
                    <div className="col-sm-4">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <h3 className="panel-title text-center"><b>Mapping info</b></h3>
                            </div>
                            <div className="panel-body">
                                <b>Status:  <span style={{ color: this.state.details.status.error ? 'red' : 'green' }}>{this.state.details.status.message}</span></b><br/>
                                <hr/>
                                { this.state.details.stats && Object.keys(this.state.details.stats).length > 0 && <div>
                                    <b>Ocurrences: </b> {this.state.details.stats.numOcurrences}<br/>
                                    <b>Total properties: </b> {this.state.details.stats.numProperties}<br/>
                                    <b>Mapped properties: </b> {this.state.details.stats.numMappedProperties}
                                         &nbsp;({this.getPercentage(this.state.details.stats.numMappedProperties,this.state.details.stats.numProperties)} %)<br/>
                                    </div> }
                                { (!this.state.details.stats || Object.keys(this.state.details.stats).length === 0) &&  <div>
                                    No statistics available yet.
                                </div>
                                }

                            </div>
                        </div>
                        <MappingTester
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
