/* eslint-disable hapi/hapi-scope-start */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const ClassSearcher = require('./ontologySearcher/classSearcher.jsx');
const PropertySearch = require('./ontologySearcher/propertySearcher.jsx');
const propTypes = {
    onSubmit: PropTypes.func //To call when either class or property is submitted
};

class OntologySearchPanel extends React.Component {
    constructor(){
        super();
        this.state = {
            view: 'classes'
        };
    }

    /**
     * Fired when class search submits a new value.
     */
    onClassSubmit(newValue ){

        this.props.onSubmit(newValue);
    }

    /**
     * Fired when class search submits a new value.
     */
    onPropertySubmit( newValue ){
        this.props.onSubmit(newValue);
    }

    changeView(newView){
        this.setState({ view: newView });
    }

    render() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title text-center"><b>Ontology Search</b></h3>
                </div>
                <div className="panel-body">
                    <ul className="nav nav-tabs">
                        <li onClick={this.changeView.bind(this,'classes')} className={this.state.view === 'classes' ? 'active' : ''}><a href="#">Classes</a></li>
                        <li onClick={this.changeView.bind(this,'properties')} className={this.state.view === 'properties' ? 'active' : ''}><a href="#">Properties</a></li>
                    </ul>
                    <br/>
                    { this.state.view === 'classes' && <ClassSearcher onSubmit={this.onClassSubmit.bind(this)}/>}
                    { this.state.view === 'properties' && <PropertySearch onSubmit={this.onPropertySubmit.bind(this)}/>}
                    <br/>
                    <i><i className="fa fa-question-circle-o" aria-hidden="true"></i>
                        &nbsp; Use this to search for classes and properties, and to insert them directly into the mapping code. </i>
                </div>
            </div>
        );
    }
}
OntologySearchPanel.propTypes = propTypes;
module.exports = OntologySearchPanel;
