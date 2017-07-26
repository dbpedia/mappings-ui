/* eslint-disable hapi/hapi-scope-start */
'use strict';

const React = require('react');
const Autosuggest = require('react-autosuggest');
const PropTypes = require('prop-types');
const Debounce = require('lodash').debounce;
const propTypes = {
    lang: PropTypes.string
};


const theme = {
    container: {
        position: 'relative',
        marginBottom: '10px'
    },
    input: 'form-control',
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
        top: 34,
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

        this.onSuggestionsFetchRequested = Debounce(this.onSuggestionsFetchRequested.bind(this),500);
    }

    loadSuggestions(value) {


        let lang = this.props.lang;
        if (!lang){
            lang = 'en';
        }
        let result = [];
        this.setState({
            isLoading: true
        });
        const self = this;
        $.ajax( {
            url: 'https://' + lang + '.wikipedia.org/w/api.php',
            jsonp: 'callback',
            dataType: 'jsonp',
            data: {
                action: 'query',
                list: 'search',
                srlimit: 5,
                srprop: 'timestamp',
                srsearch: 'intitle:' + value.toLowerCase(),
                format: 'json'
            },
            xhrFields: { withCredentials: true },
            success: function (response) {


                if (!response || !response.query ) {
                    result = [];
                }
                else {

                    result = response.query.search;
                }


                self.setState({
                    isLoading: false,
                    suggestions: result
                });

            }
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

    shouldRender(value){
        return value.length > 1;
    }

    extract(){

        //const urlTitle = this.state.value.replace(new RegExp(' ', 'g'), '_');
        //const wikiURL = 'https://' + this.props.lang + '.wikipedia.org/wiki/' + urlTitle;
        alert('NOT IMPLEMENTED');
    }

    render() {


        const  { suggestions } = this.state;
        const inputProps = {
            placeholder: 'Wikipedia page title...',
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
                                shouldRenderSuggestions={this.shouldRender.bind(this)}
                                highlightFirstSuggestion={true}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <button className="btn btn-primary btn-block" type="button" onClick={this.extract.bind(this)}>Extract</button>
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

MappingTesterPanel.propTypes = propTypes;
module.exports = MappingTesterPanel;
