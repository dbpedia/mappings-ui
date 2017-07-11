'use strict';
const Actions = require('./actions');
const Alert = require('../../components/alert.jsx');
const Button = require('../../components/form/button.jsx');
const ControlGroup = require('../../components/form/control-group.jsx');
const MappingLangSelector = require('../../components/mapping-lang-selector.jsx');

const React = require('react');
const Spinner = require('../../components/form/spinner.jsx');
const Store = require('./store');
const TextControl = require('../../components/form/text-control.jsx');


class Form extends React.Component {
    constructor(props) {

        super(props);

        this.input = {};
        this.state = Store.getState();
    }

    componentDidMount() {

        this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));

        if (this.input.name) {
            this.input.name.focus();
        }

        this.setState({ mappingsLang:'en' });
    }

    componentWillUnmount() {

        this.unsubscribeStore();
    }

    onStoreChange() {

        this.setState(Store.getState());
    }

    handleNewLanguage(newLang){

        this.setState( { mappingsLang:newLang } );

    }


    handleSubmit(event) {



        event.preventDefault();
        event.stopPropagation();

        Actions.sendRequest({
            name: this.input.name.value(),
            username: this.input.username.value(),
            password: this.input.password.value(),
            email: this.input.email.value(),
            mappingsLang: this.state.mappingsLang
        });
    }

    render() {

        let alert = [];

        if (this.state.success) {
            alert = <Alert
                type="success"
                message="Success. Redirecting..."
            />;
        }
        else if (this.state.error) {
            alert = <Alert
                type="danger"
                message={this.state.error}
            />;
        }

        let formElements;

        if (!this.state.success) {
            formElements = <fieldset>
                <TextControl
                    ref={(c) => (this.input.name = c)}
                    name="name"
                    label="Name"
                    hasError={this.state.hasError.name}
                    help={this.state.help.name}
                    disabled={this.state.loading}
                />
                <TextControl
                    ref={(c) => (this.input.email = c)}
                    name="email"
                    label="Email"
                    hasError={this.state.hasError.email}
                    help={this.state.help.email}
                    disabled={this.state.loading}
                />
                <TextControl
                    ref={(c) => (this.input.username = c)}
                    name="username"
                    label="Username"
                    hasError={this.state.hasError.username}
                    help={this.state.help.username}
                    disabled={this.state.loading}
                />
                <TextControl
                    ref={(c) => (this.input.password = c)}
                    name="password"
                    label="Password"
                    type="password"
                    hasError={this.state.hasError.password}
                    help={this.state.help.password}
                    disabled={this.state.loading}
                />


                <MappingLangSelector
                    selectedLang={this.state.mappingsLang}
                    disabled={this.state.loading}
                    callback={this.handleNewLanguage.bind(this)}/>




                <ControlGroup hideLabel={true} hideHelp={true}>
                    <Button
                        type="submit"
                        inputClasses={{ 'btn-primary': true }}
                        disabled={this.state.loading}>

                        Create my account
                        <Spinner space="left" show={this.state.loading} />
                    </Button>
                </ControlGroup>
            </fieldset>;
        }

        return (
            <section>

                <form onSubmit={this.handleSubmit.bind(this)}>
                    {alert}
                    {formElements}
                </form>
            </section>
        );
    }
}


module.exports = Form;
