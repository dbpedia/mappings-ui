'use strict';
const Actions = require('./actions');
const Alert = require('../../../components/alert.jsx');
const Button = require('../../../components/form/button.jsx');
const ControlGroup = require('../../../components/form/control-group.jsx');

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
    title: PropTypes.string,
    visible: PropTypes.bool

};


class CreateNewForm extends React.Component {
    constructor(props) {

        super(props);

        this.els = {};
        this.state = {
            title: '',
            visible: 'true'
        };
    }


    componentDidUpdate() {

        if (this.props.show && this.state.title.length === 0 ) {
            this.els.title.focus();
        }
    }


    onVisibleChange(event){

        this.setState({ visible: event.target.value });
    }


    onSubmit(event) {

        event.preventDefault();
        event.stopPropagation();

        Actions.createNew({
            title: this.state.title,
            visible: this.state.visible,
            markdown: ''
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
                name="title"
                label="Title"
                ref={(c) => (this.els.title = c)}
                value={this.state.name}
                onChange={LinkState.bind(this)}
                hasError={this.props.hasError.title}
                help={this.props.help.title}
                disabled={this.props.loading}
            />


            <ControlGroup hideLabel={true} hideHelp={true}>
                <b>Status:</b>
                <select value={this.state.visible} onChange={this.onVisibleChange.bind(this)} className="form-control language-select">
                    <option value="true">Visible</option>
                    <option value="false">Not visible</option>
                </select>
            </ControlGroup>

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
                header="Create new post"
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
