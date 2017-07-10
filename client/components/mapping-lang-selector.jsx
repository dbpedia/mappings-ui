/* eslint-disable hapi/hapi-scope-start */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const ControlGroup = require('./form/control-group.jsx');

const propTypes = {
    selectedLang: PropTypes.string, //Value selected now
    callback: PropTypes.func,        //Will be called with new value,
    disabled: PropTypes.bool,
    onChange: PropTypes.func, //Will be called with the whole event,
    name: PropTypes.string
};


class MappingLangSelector extends React.Component {



    value() {

        return this.input.value;
    }

    //Function that calls the parent and passes the new value.
    //Then, the parent updates the passed prop and the select updates.
    //No state is stored here, but in the parent.
    selectHandler(event){
        if (this.props.callback){
            this.props.callback(event.target.value);
        }
        if (this.props.onChange){
            this.props.onChange(event);
        }
    }

    render() {


        const languages = [
            { tag: '', name: 'All languages' },
            { tag: 'ar', name: 'Arabic' },
            { tag: 'az', name: 'Azeri' },
            { tag: 'be', name: 'Belarusian' },
            { tag: 'bg', name: 'Bulgarian' },
            { tag: 'bn', name: 'Malay (Brunei Darussalam)' },
            { tag: 'ca', name: 'Catalan' },
            { tag: 'commons', name: 'Commons' },
            { tag: 'cs', name: 'Czech' },
            { tag: 'cy', name: 'Welsh' },
            { tag: 'da', name: 'Danish' },
            { tag: 'de', name: 'German' },
            { tag: 'el', name: 'Greek' },
            { tag: 'en', name: 'English' },
            { tag: 'eo', name: 'Esperanto' },
            { tag: 'es', name: 'Spanish' },
            { tag: 'et', name: 'Estonian' },
            { tag: 'eu', name: 'Basque' },
            { tag: 'fa', name: 'Farsi' },
            { tag: 'fi', name: 'Finnish' },
            { tag: 'fr', name: 'French' },
            { tag: 'ga', name: 'Irish' },
            { tag: 'gl', name: 'Galician' },
            { tag: 'hi', name: 'Hindi' },
            { tag: 'hr', name: 'Croatian' },
            { tag: 'hu', name: 'Hungarian' },
            { tag: 'hy', name: 'Armenian' },
            { tag: 'id', name: 'Indonesian' },
            { tag: 'it', name: 'Italian' },
            { tag: 'ja', name: 'Japanese' },
            { tag: 'ko', name: 'Korean' },
            { tag: 'lt', name: 'Lithuanian' },
            { tag: 'lv', name: 'Latvian' },
            { tag: 'mk', name: 'Macedonian' },
            { tag: 'mt', name: 'Maltese' },
            { tag: 'nl', name: 'Dutch' },
            { tag: 'pl', name: 'Polish' },
            { tag: 'pt', name: 'Portuguese' },
            { tag: 'ro', name: 'Romanian' },
            { tag: 'ru', name: 'Russian' },
            { tag: 'sk', name: 'Slovak' },
            { tag: 'sl', name: 'Slovenian' },
            { tag: 'sr', name: 'Serbian' },
            { tag: 'sv', name: 'Swedish' },
            { tag: 'tr', name: 'Turkish' },
            { tag: 'uk', name: 'Ukrainian' },
            { tag: 'ur', name: 'Urdu' },
            { tag: 'vi', name: 'Vietnamese' },
            { tag: 'war', name: 'War' },
            { tag: 'zh', name: 'Chinese' }
        ];



        const optionElems = [];
        languages.forEach( (elem) => {
            if (elem.tag && elem.tag.length > 0 ){
                optionElems.push(<option value={elem.tag} key={elem.tag}>{elem.name} ({elem.tag})</option>);
            }
            else {
                optionElems.push(<option value={elem.tag} key={elem.tag}>{elem.name}</option>);
            }

        });

        return (

        <ControlGroup hideLabel={true} hideHelp={true}>
            <b>Mapping language:</b>

            <select  ref={(c) => (this.input = c)} name={this.props.name} disabled={this.props.disabled ? 'disabled' : undefined} className="form-control language-select" value={this.props.selectedLang} onChange={(ev) => this.selectHandler(ev)}>
                {optionElems}
            </select>
        </ControlGroup>


        );
    }
}

MappingLangSelector.propTypes = propTypes;


module.exports = MappingLangSelector;
