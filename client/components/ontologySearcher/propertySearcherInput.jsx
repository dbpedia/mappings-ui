/* eslint-disable hapi/hapi-scope-start */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const Autosuggest = require('react-autosuggest');
const JsonFetch = require('../../helpers/json-fetch');
const Debounce = require('lodash').debounce;



const theme = {
    container: {
        position: 'relative',
        marginBottom: '10px'
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


const getSuggestionValue = (suggestion) => suggestion.name;

const renderSuggestion = (suggestion) => (

    <div>
        <span className="propertySearchMain"><b>{suggestion.name}</b></span><br/>
        <span className="propertySearchDetail">domain: {suggestion.domain.name}</span> <br/>
        <span className="propertySearchDetail" >range: {suggestion.range.name}</span>
    </div>
);

const propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    id: PropTypes.string
};
class PropertySearcherInput extends React.Component {


    constructor(){
        super();

        this.state = {
            value: '',
            suggestions: [],
            loading: false
        };

        this.onSuggestionsFetchRequested = Debounce(this.onSuggestionsFetchRequested.bind(this),300);

    }

    loadSuggestions(value) {

        this.setState({
            isLoading: true
        });

        let result = [];
        const request = { method: 'GET', url: '/api/search/properties', query: { name: value } };
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

        const e = {
            target: {
                value: newValue
            }
        };

        this.props.onChange(e);
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

        theme.input = this.props.className;

        const  { suggestions } = this.state;
        const inputProps = {
            placeholder: this.props.placeholder,
            value: this.props.value,
            onChange: this.onChange.bind(this)
        };



        return (

                            <Autosuggest
                                suggestions={suggestions}
                                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
                                onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(this)}
                                getSuggestionValue={getSuggestionValue}
                                renderSuggestion={renderSuggestion}
                                inputProps={inputProps}
                                theme={theme}
                                highlightFirstSuggestion={true}
                            />


        );
    }
}

PropertySearcherInput.propTypes = propTypes;
module.exports = PropertySearcherInput;
