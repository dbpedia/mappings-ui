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
    username: PropTypes.string,
    password: PropTypes.string,
    email: PropTypes.string,
    mappingsLang: PropTypes.string

};


class CreateNewForm extends React.Component {
    constructor(props) {

        super(props);

        this.els = {};
        this.state = {
            name: '',
            username:'',
            email: '',
            password:'',
            mappingsLang: 'all'
        };
    }


    /*componentDidUpdate() {

        if (this.props.show && this.state.name.length === 0) {
            this.els.name.focus();
        }
    }*/

    handleNewLanguage(newLang){

        this.setState( { mappingsLang:newLang } );
    }


    onSubmit(event) {

        event.preventDefault();
        event.stopPropagation();

        Actions.createNew({
            name: this.state.name,
            username: this.state.username,
            email: this.state.email,
            password: this.state.password,
            mappingsLang: this.state.mappingsLang
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
                name="name"
                label="Name"
                ref={(c) => (this.els.name = c)}
                value={this.state.name}
                onChange={LinkState.bind(this)}
                hasError={this.props.hasError.name}
                help={this.props.help.name}
                disabled={this.props.loading}
            />
            <TextControl
                ref={(c) => (this.els.username = c)}
                name="username"
                label="Username"
                value={this.state.username}
                onChange={LinkState.bind(this)}
                hasError={this.props.hasError.username}
                help={this.props.help.username}
                disabled={this.props.loading}
            />
            <TextControl
                name="email"
                label="Email"
                value={this.state.email}
                onChange={LinkState.bind(this)}
                hasError={this.props.hasError.email}
                help={this.props.help.email}
                disabled={this.props.loading}
            />
            <TextControl
                name="password"
                label="Password"
                type="password"
                value={this.state.password}
                onChange={LinkState.bind(this)}
                hasError={this.props.hasError.password}
                help={this.props.help.password}
                disabled={this.props.loading}
            />
            <MappingLangSelector
                selectedLang={this.state.mappingsLang}
                disabled={this.props.loading}
                callback={this.handleNewLanguage.bind(this)}/>

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
                header="Create new account"
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
