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
const WikipediaPageSearcher = require('../../../components/wikipediaPageSearcher.jsx');
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
        this.setState({ 'wikiSearchValue':'' });

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
                text: <span><i className="fa fa-pencil" aria-hidden="true"></i>&nbsp;Edit</span>,
                action: this.goToEdition.bind(this)

            }

        ];


        return (
            <section className="container">
                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}/>
                    <h1 >

                        <Link to="/mappings">Mappings</Link> / <Link to={'/mappings/view/' + this.state.details._id.template + '/' + lang}>{title}</Link>
                    </h1>
                    {this.state.details.hydrated && <span>Last edited on { Moment(this.state.details.edition.date).format('DD/MM/YYYY, HH:mm:ss') } by { this.state.details.edition.username}</span>}
                    {this.state.details.hydrated && <span><br/>Edition comment: {this.state.details.oldComment}</span>}
                    {this.state.details.edition.comment}
                </div>

                <div className="row">
                    <div className="col-sm-8">


                        <DetailsForm {...this.state.details}/>


                    </div>
                    <div className="col-sm-4">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <h3 className="panel-title text-center"><b>Mapping info</b></h3>
                            </div>
                            <div className="panel-body">

                                <b>Status:  <span style={{ color: this.state.details.status.error ? 'red' : 'green' }}>{this.state.details.status.message}</span></b><br/>
                                <hr/>
                                <b>Ocurrences: </b> {this.state.details.stats.numOcurrences}<br/>
                                <b>Total properties: </b> {this.state.details.stats.numProperties}<br/>
                                <b>Mapped properties: </b> {this.state.details.stats.numMappedProperties}
                                     &nbsp;({this.getPercentage(this.state.details.stats.numMappedProperties,this.state.details.stats.numProperties)} %)<br/>
                                <b>Property ocurrences: </b> {this.state.details.stats.numPropertyOcurrences}<br/>
                                <b>Mapped property ocurrences: </b> {this.state.details.stats.numMappedPropertyOcurrences}
                                    &nbsp;({this.getPercentage(this.state.details.stats.numMappedPropertyOcurrences,this.state.details.stats.numPropertyOcurrences)} %)<br/>
                                <b>Not found properties: </b> {this.state.details.stats.numPropertiesNotFound}
                                    &nbsp;({this.getPercentage(this.state.details.stats.numPropertiesNotFound,this.state.details.stats.numProperties)} %)<br/>
                            </div>
                        </div>
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <h3 className="panel-title text-center"><b>Mapping test</b></h3>
                            </div>
                            <div className="panel-body">
                                <div className="row">
                                    <div className="col-sm-12">
                                        <WikipediaPageSearcher
                                            value={this.state.wikiSearchValue}
                                            onChange={this.onWikiSearchChange.bind(this)}/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-sm-12">
                                        <button className="btn btn-primary btn-block" type="button">Extract</button>
                                    </div>
                                </div>

                                {/*<div className="input-group">
                                    <input type="text" className="form-control" placeholder="Type Wikipedia page name..."/>
                                    <span className="input-group-btn">
                                        <button className="btn btn-default" type="button">Extract</button>
                                    </span>
                                </div>*/}
                                <br/>
                                <i><i className="fa fa-question-circle-o" aria-hidden="true"></i>
                                    &nbsp; Use this to test the mapping on a real Wikipedia Page and extract the resulting RDF. </i>

                            </div>
                        </div>
                    </div>

                </div>
            </section>
        );
    }
}

EditPage.propTypes = propTypes;


module.exports = EditPage;
