/* eslint-disable hapi/hapi-scope-start */
'use strict';

const React = require('react');
const Autosuggest = require('react-autosuggest');
const JsonFetch = require('../helpers/json-fetch');


const theme = {
    container: {
        position: 'relative',
        marginBottom: '10px'
    },
    input: {
        width: '100%',
        height: 30,
        padding: '10px 20px',
        fontFamily: 'Helvetica, sans-serif',
        fontWeight: 300,
        fontSize: 16,
        border: '1px solid #aaa',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4
    },
    inputFocused: {
        outline: 'none'
    },
    inputOpen: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
    },
    suggestionsContainer: {
        display: 'none'
    },
    suggestionsContainerOpen: {
        display: 'block',
        position: 'absolute',
        top: 30,
        width: '100%',
        border: '1px solid #aaa',
        backgroundColor: '#fff',
        fontFamily: 'Helvetica, sans-serif',
        fontWeight: 300,
        fontSize: 16,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        zIndex: 2
    },
    suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none'
    },
    suggestion: {
        cursor: 'pointer',
        padding: '10px 20px'
    },
    suggestionHighlighted: {
        backgroundColor: '#ddd'
    }
};


const getSuggestionValue = (suggestion) => suggestion.title;

const renderSuggestion = (suggestion) => (

    <div>
        {suggestion.title}
    </div>
);

// Teach Autosuggest how to calculate suggestions for any given input value.

class MappingTesterPanel extends React.Component {


    constructor(){
        super();

        this.state = {
            value: '',
            suggestions: [],
            loading: false
        };
    }

    loadSuggestions(value) {

        this.setState({
            isLoading: true
        });

        let result = [];
        const request = { method: 'GET', url: '/api/search/wiki', query: { title: value } };
        JsonFetch(request, (err, response) => {

            if (err || !response){
                result = [];
            }

            if (response){
                result = response;
            }

            this.setState({
                isLoading: false,
                suggestions: result
            });
        });

    }


    onChange(event, { newValue }){
        this.setState({
            value: newValue
        });
    };

    onSuggestionsFetchRequested({ value }){
        this.loadSuggestions(value);

    };

    // Autosuggest will call this function every time you need to clear suggestions.
    onSuggestionsClearRequested(){
        this.setState({
            suggestions: []
        });
    };


    render() {

        const  { suggestions } = this.state;
        const inputProps = {
            placeholder: 'Wikipedia page...',
            value: this.state.value,
            onChange: this.onChange.bind(this)
        };


        return (

            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title text-center"><b>Mapping test</b></h3>
                </div>
                <div className="panel-body">
                    <div className="row">
                        <div className="col-sm-12">
                            <Autosuggest
                                suggestions={suggestions}
                                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
                                onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(this)}
                                getSuggestionValue={getSuggestionValue}
                                renderSuggestion={renderSuggestion}
                                inputProps={inputProps}
                                theme={theme}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <button className="btn btn-primary btn-block" type="button" onClick={() => alert('Not implemented yet.')}>Extract</button>
                        </div>
                    </div>
                    <br/>
                    <i><i className="fa fa-question-circle-o" aria-hidden="true"></i>
                        &nbsp; Use this to test the mapping on a real Wikipedia Page and extract the resulting RDF. </i>
                </div>
            </div>
        );
    }
}


module.exports = MappingTesterPanel;
