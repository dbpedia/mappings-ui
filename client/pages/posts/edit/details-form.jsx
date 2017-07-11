'use strict';
const Actions = require('./actions');
const Alert = require('../../../components/alert.jsx');
const Button = require('../../../components/form/button.jsx');
const ControlGroup = require('../../../components/form/control-group.jsx');
const LinkState = require('../../../helpers/link-state');
const PropTypes = require('prop-types');
const React = require('react');
const Spinner = require('../../../components/form/spinner.jsx');
const TextControl = require('../../../components/form/text-control.jsx');
const ReactMarkdown = require('react-markdown');
//const Brace = require('brace').default;
const AceEditor = require('react-ace').default;
require('brace/mode/markdown');
require('brace/theme/github');


const propTypes = {
    postId: PropTypes.string,
    title: PropTypes.string,
    visible: PropTypes.bool,
    markdown: PropTypes.string,
    error: PropTypes.string,
    hasError: PropTypes.object,
    help: PropTypes.object,
    loading: PropTypes.bool,
    showSaveSuccess: PropTypes.bool
};


class DetailsForm extends React.Component {
    constructor(props) {

        super(props);

        this.state = {
            title: props.title,
            visible: (props.visible),
            markdown: props.markdown,
            editing: true
        };
    }

    onChange(newValue) {

        this.setState({ markdown:newValue });
    }

    onVisibleChange(event){


        this.setState({ visible: event.target.value  === 'true' });
    }

    handleSubmit(event) {

        event.preventDefault();
        event.stopPropagation();

        const id = this.props.postId;
        const data = {
            title: this.state.title,
            visible: this.state.visible,
            markdown: this.state.markdown
        };

        Actions.saveDetails(id, data);
    }


    changeEditing(newValue){

        this.setState({ editing:newValue });
    }

    render() {

        const alerts = [];

        if (this.props.showSaveSuccess) {
            alerts.push(<Alert
                key="success"
                type="success"
                onClose={Actions.hideDetailsSaveSuccess}
                message="Success. Changes have been saved."
            />);
        }

        if (this.props.error) {
            alerts.push(<Alert
                key="danger"
                type="danger"
                message={this.props.error}
            />);
        }

        const tabs =  <ul className="nav nav-tabs edition-tabs">
            <li className={this.state.editing ? 'active' : ''} onClick={this.changeEditing.bind(this,true)}><a href="#">Edit</a></li>
            <li className={!this.state.editing ? 'active' : ''} onClick={this.changeEditing.bind(this,false)}><a href="#">Preview</a></li>
        </ul>;


        const editElements = <div>
            <div className="row">
                <div className="col-sm-9">
                    <TextControl
                        name="title"
                        label="Title"
                        value={this.state.title}
                        onChange={LinkState.bind(this)}
                        hasError={this.props.hasError.name}
                        help={this.props.help.title}
                        disabled={this.props.loading || this.props.postId === 'home'}
                    />
                </div>
                <div className="col-sm-3">
                    <ControlGroup hideLabel={true} hideHelp={true}>
                        <b>Status:</b>
                        <select value={this.state.visible} onChange={this.onVisibleChange.bind(this)} className="form-control language-select" disabled={this.props.postId === 'home'}>
                            <option value="true">Visible</option>
                            <option value="false">Not visible</option>
                        </select>
                    </ControlGroup>
                </div>
            </div>

            <AceEditor
                mode="markdown"
                theme="github"
                onChange={this.onChange.bind(this)}
                name="edition"
                value={this.state.markdown ? this.state.markdown : ''}
                width="100%"
                fontSize={15}
                wrapEnabled={true}
                maxLines={40}
                editorProps={ { $blockScrolling: true } }
            />

        </div>;

        const previewElements =    <div>
            <ReactMarkdown source={this.state.markdown ? this.state.markdown : ''} />
            { (!this.state.markdown || this.state.markdown.length === 0) &&
            <i>This page is empty.</i>
            }
            </div>;

        const formElements = <fieldset>

            {alerts}


            {tabs}


            {this.state.editing && editElements}
            {!this.state.editing && previewElements}

            <hr/>


            <ControlGroup hideLabel={true} hideHelp={true}>
                <Button
                    type="submit"
                    inputClasses={{ 'btn-primary': true }}
                    disabled={this.props.loading}>

                    Save changes
                    <Spinner space="left" show={this.props.loading} />
                </Button>
            </ControlGroup>
        </fieldset>;

        return (
            <form onSubmit={this.handleSubmit.bind(this)}>
                {formElements}
            </form>
        );
    }
}

DetailsForm.propTypes = propTypes;


module.exports = DetailsForm;
