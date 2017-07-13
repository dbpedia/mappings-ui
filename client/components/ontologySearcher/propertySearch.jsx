/* eslint-disable hapi/hapi-scope-start */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const Autosuggest = require('react-autosuggest');
const JsonFetch = require('../../helpers/json-fetch');



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


const getSuggestionValue = (suggestion) => suggestion.name;

const renderSuggestion = (suggestion) => (

    <div>
        <span className="propertySearchMain"><b>{suggestion.name}</b></span> ({suggestion.count})<br/>
        <span className="propertySearchDetail">domain: {suggestion.domain}</span> <br/>
        <span className="propertySearchDetail" >range: {suggestion.range}</span>
    </div>
);

const propTypes = {
    onSubmit: PropTypes.func //To call when button is clicked
};
class ClassSearcher extends React.Component {


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
        this.setState({
            value: newValue
        });
    };

    onSubmit(){
        this.props.onSubmit(this.state.value);
    }

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
            placeholder: 'Property name...',
            value: this.state.value,
            onChange: this.onChange.bind(this)
        };


        return (

            <div>
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
                            <button
                                className="btn btn-primary btn-block"
                                type="button"
                                onClick={this.onSubmit.bind(this)}>Insert property</button>
                        </div>
                    </div>
            </div>

        );
    }
}

ClassSearcher.propTypes = propTypes;
module.exports = ClassSearcher;
