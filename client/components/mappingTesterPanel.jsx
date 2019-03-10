/* eslint-disable hapi/hapi-scope-start */
'use strict';

const React = require('react');
const Autosuggest = require('react-autosuggest');
const PropTypes = require('prop-types');
const Debounce = require('lodash').debounce;
const Modal = require('./modal.jsx');
const Alert = require('./alert.jsx');
const CopyToClipboard = require('react-copy-to-clipboard');
const AceEditor = require('react-ace').default;
require('brace/mode/json');
require('brace/theme/github');
const Editor = require('./turtle-editor.jsx');

const propTypes = {
    lang: PropTypes.string,
    template: PropTypes.string,
    rml: PropTypes.string,
    action: PropTypes.func,
    loading: PropTypes.bool,
    dump: PropTypes.string,
    msg: PropTypes.string,
    showModal: PropTypes.bool,
    error: PropTypes.string
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

const unicodeToChar = function (text) {
    return text.replace(/\\u[\dA-F]{4}/gi,
        (match) => {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        });
};

// Teach Autosuggest how to calculate suggestions for any given input value.
class MappingTesterPanel extends React.Component {
    constructor(){
        super();
        this.state = {
            value: '',
            suggestions: [],
            loading: false,
            format:'turtle-triples',
            cachedResults: undefined //Cache of Wikipedia call
        };

        //Minimal wait, as suggestions are local
        this.onSuggestionsFetchRequested = Debounce(this.onSuggestionsFetchRequested.bind(this),0);
    }

    formatChange(event){
        this.setState({ format: event.target.value });
    }

    loadSuggestions(value) {
        if (this.state.cachedResults !== undefined) { //Get results from cache
            const result = this.state.cachedResults.filter((elem) => {
                if (elem.title.toLowerCase().indexOf(value.toLowerCase()) > -1 ) {
                    return true;
                }
            });

            this.setState({ suggestions:result.slice(0,5), loading: false });
        }

        else {      //Load to cache and then, call this method again and search
            let lang = this.props.lang;
            if (!lang){
                lang = 'en';
            }
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
                    list: 'embeddedin',
                    eilimit: 500,
                    eititle: 'Template:' + this.props.template,
                    format: 'json'
                },
                xhrFields: { withCredentials: true },
                success: function (response) {
                    if (!response || !response.query ) {
                        self.setState({ cachedResults : [] }, () => {
                            self.loadSuggestions(value);
                        });
                    }
                    else {
                        //Decode responses
                        const res = response.query.embeddedin;
                        for (let i = 0; i < res.length; ++i) {
                            res[i].title = unicodeToChar(res[i].title);
                        }
                        self.setState({ cachedResults : res }, () => {
                            self.loadSuggestions(value);
                        });
                    }
                }
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal !== this.props.showModal) {
            this.setState({ showModal: nextProps.showModal });
        }

        if (nextProps.dump !== this.props.dump){
            this.setState({ dump: nextProps.dump });
        }
        if (nextProps.error !== this.props.error) {
            this.setState({ error: nextProps.error });
        }
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
        return value.length > 0;
    }

    extract(){
        this.props.action(this.props.template,this.props.lang,this.props.rml,this.state.value,this.state.format);

    }

    render() {
        const  { suggestions } = this.state;
        const inputProps = {
            placeholder: 'Wikipedia page title...',
            value: this.state.value,
            onChange: this.onChange.bind(this)
        };

        /*const tableBody = [];
        if (this.props.dump) {
            this.props.dump.forEach((triple,i) => {
                tableBody.push(
                    <tr key={i}><td>{triple[0]}</td><td>{triple[1]}</td><td>{triple[2]}</td></tr>
                );
            });
        }*/

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title text-center"><b>Mapping test</b></h3>
                </div>
                <div className="panel-body">

                    {   this.state.error &&
                            <Alert
                                key="danger"
                                type="danger"
                                onClose={() => {

                                    this.setState({ error:undefined });
                                }}
                                message={this.state.error}
                            />
                    }
                    <div className="testModalWrapper">
                        <Modal
                            style={{ display: (this.state.showModal ? '' :  'none') }}
                            onClose={() => {
                                this.setState({ showModal:false });
                            }}
                            header={<div><span>Extraction result</span><CopyToClipboard text={this.state.dump}>
                                <span><a href="#">&nbsp;(Copy text)</a></span>
                            </CopyToClipboard></div>}
                            show={this.state.showModal}>

                            <div className="row">
                                <div className="col-sm-12">
                                    {this.state.format !== 'rdf-json' &&
                                        <Editor content={this.state.dump}
                                                ref="editor"
                                                canExternallyChange={true}
                                                readOnly={true}
                                                showGutter={false}
                                                onChange={() => {}}
                                                id="extractionEditor"/>
                                    }

                                    { this.state.format === 'rdf-json' &&
                                    <AceEditor
                                        className="editor"
                                        mode="json"
                                        theme="github"
                                        onChange={() => {}}
                                        readOnly={true}
                                        name="rdfjsonEditor"
                                        value={this.state.dump ? (this.state.dump) : ''}
                                        width="100%"
                                        fontSize={15}
                                        wrapEnabled={true}
                                        maxLines={40}
                                        showGutter={false}
                                        editorProps={ { $blockScrolling: true } }
                                    />
                                    }
                                </div>
                            </div>
                            <div className="row">
                            </div>
                            <div className="row">
                                <div className="col-sm-12">
{/*
                                    <textarea rows="20" value={this.state.dump} style={{ width: '100%', height:'90%',resize:'none' }}></textarea>
*/}
                                   {/* <AceEditor
                                        mode="turtle"
                                        theme="github"
                                        onChange={this.onChange.bind(this)}
                                        name="edition"
                                        value={this.state.dump ? this.state.dump : ''}
                                        width="100%"
                                        fontSize={15}
                                        wrapEnabled={true}
                                        maxLines={40}
                                        editorProps={ { $blockScrolling: true } }
                                    />*/}
                                </div>
                            </div>
                        </Modal>
                    </div>
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
                        <div className="col-sm-12">
                            <select className="form-control"
                                    style={{ marginTop:'0px',marginBottom:'5px' }}
                                    value={this.state.format}
                                    onChange={this.formatChange.bind(this)}>
                                <option value="turtle-triples">Turtle Triples</option>
                                <option value="turtle-quads">Turtle Quads</option>
                                <option value="n-triples">N-Triples</option>
                                <option value="n-quads">N-Quads</option>
                                <option value="rdf-json">RDF-JSON</option>
                            </select>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <button
                                className="btn btn-primary btn-block"
                                type="button"
                                onClick={this.extract.bind(this)}
                                disabled={this.props.loading}>
                                { !this.props.loading && <span>Extract</span> }
                                { this.props.loading && <span><i className="fa fa-refresh fa-spin"></i> Extracting...</span>}
                            </button>
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
