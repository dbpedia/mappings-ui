'use strict';
const Actions = require('./actions');
const Alert = require('../../../components/alert.jsx');
const Button = require('../../../components/form/button.jsx');
const LinkState = require('../../../helpers/link-state');
const PropTypes = require('prop-types');
const React = require('react');
const Spinner = require('../../../components/form/spinner.jsx');
//const Brace = require('brace').default;
const AceEditor = require('react-ace').default;
require('brace/mode/markdown');
require('brace/theme/github');


const propTypes = {
    _id: PropTypes.object,
    rml: PropTypes.string,
    version: PropTypes.number,
    edition: PropTypes.object,
    status: PropTypes.object,
    stats: PropTypes.object,
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
            _id: props._id,
            version: props.version,
            rml: props.rml,
            edition: props.edition,
            status: props.status,
            stats: props.stats
        };
    }

    onChange(newValue) {

        this.setState({ rml:newValue });
    }

    onVisibleChange(event){


        this.setState({ visible: event.target.value  === 'true' });
    }

    handleSubmit(event) {

        event.preventDefault();
        event.stopPropagation();

        const data = {
            rml: this.state.rml,
            comment: this.state.edition.comment
        };

        Actions.saveDetails(this.props._id.template,this.props._id.lang, data);
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




        const editElements = <div>
            <div className="row">
                <div className="col-sm-9">

                        <input type="text"
                               name="edition.comment"
                               value={this.state.edition.comment}
                               onChange={LinkState.bind(this)}
                               className="form-control" placeholder="Type edition comment (optional)"/>

                </div>
                <div className="col-sm-3">
                    <Button
                        type="submit"
                        inputClasses={{ 'btn-primary': true, 'btn-block':true }}
                        disabled={this.props.loading}>

                        Save changes
                        <Spinner space="left" show={this.props.loading} />
                    </Button>
                </div>

            </div>

            <AceEditor
                className="rml-editor"
                mode="markdown"
                theme="github"
                onChange={this.onChange.bind(this)}
                name="edition"
                value={this.state.rml ? this.state.rml : ''}
                width="100%"
                fontSize={15}
                wrapEnabled={true}
                maxLines={40}
                editorProps={ { $blockScrolling: true } }
            />

        </div>;

        const formElements = <fieldset>

            {alerts}

            {editElements}


            <hr/>



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
