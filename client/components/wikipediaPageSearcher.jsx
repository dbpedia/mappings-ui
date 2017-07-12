/* eslint-disable hapi/hapi-scope-start */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const Autosuggest = require('react-autosuggest');
const propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
};


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


const pages = [
    {
        title: 'David_Beckham',
        url: 'http://wikipedia.org/wiki/David_Beckham'
    },
    {
        title: 'Abcd_efgh_ijklm_nopqrs_uvwxyz',
        url: 'http://wikipedia.org/wiki/David_Beckham'
    }
];

const getSuggestionValue = (suggestion) => suggestion.title;

const renderSuggestion = (suggestion) => (

    <div>
        {suggestion.title}
    </div>
);

// Teach Autosuggest how to calculate suggestions for any given input value.

class WikipediaPageSearcher extends React.Component {


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


        //Todo: get wiki pages from backend
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        const result =  inputLength === 0 ? [] : pages.filter((page) =>

            page.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
        );

        this.setState({
            isLoading: false,
            suggestions: result
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
            value: this.props.value,
            onChange: this.props.onChange
        };


        return (

            <div>
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

        );
    }
}


WikipediaPageSearcher.propTypes = propTypes;
module.exports = WikipediaPageSearcher;
