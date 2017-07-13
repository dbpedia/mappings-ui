'use strict';
const Actions = require('./actions');
const Alert = require('../../../components/alert.jsx');
const Button = require('../../../components/form/button.jsx');
const ControlGroup = require('../../../components/form/control-group.jsx');
const MappingLangSelector = require('../../../components/mapping-lang-selector.jsx');

const LinkState = require('../../../helpers/link-state.js');
const Modal = require('../../../components/modal.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const Spinner = require('../../../components/form/spinner.jsx');
const TextControl = require('../../../components/form/text-control.jsx');


const propTypes = {
    error: PropTypes.string,
    hasError: PropTypes.object,
    help: PropTypes.object,
    history: PropTypes.object,
    loading: PropTypes.bool,
    show: PropTypes.bool,
    template: PropTypes.string,
    lang: PropTypes.string

};


class CreateNewForm extends React.Component {
    constructor(props) {

        super(props);

        this.els = {};
        this.state = {
            template: '',
            lang: 'en'
        };
    }


    componentDidUpdate() {

        if (this.props.show && this.state.template.length === 0 ) {
            this.els.template.focus();
        }
    }


    onLangChange(event){

        this.setState({ lang: event.target.value });
    }


    onSubmit(event) {

        event.preventDefault();
        event.stopPropagation();

        Actions.createNew({
            template: this.state.template,
            lang: this.state.lang,
            rml: '',
            comment: 'New mapping created'
        }, this.props.history);
    }

    render() {

        let alert;

        if (this.props.error) {
            alert = <Alert
                type="danger"
                message={this.props.error}
            />;
        }

        const formElements = <fieldset>
            {alert}
            <TextControl
                name="template"
                label="Template Name"
                ref={(c) => (this.els.template = c)}
                value={this.state.template}
                onChange={LinkState.bind(this)}
                hasError={this.props.hasError.template}
                help={this.props.help.template}
                disabled={this.props.loading}
            />


            <MappingLangSelector
                selectedLang={this.state.lang}
                disabled={this.state.loading}
                disableAll={true}
                onChange={this.onLangChange.bind(this)}/>


            <ControlGroup hideLabel={true} hideHelp={true}>

                <Button
                    type="submit"
                    inputClasses={{ 'btn-primary': true }}
                    disabled={this.props.loading}>

                    Create
                    <Spinner space="left" show={this.props.loading} />
                </Button>
            </ControlGroup>
        </fieldset>;

        return (
            <Modal
                header="Create new mapping"
                show={this.props.show}
                onClose={Actions.hideCreateNew}>

                <form onSubmit={this.onSubmit.bind(this)}>
                    {formElements}
                </form>
            </Modal>
        );
    }
}

CreateNewForm.propTypes = propTypes;


module.exports = CreateNewForm;
