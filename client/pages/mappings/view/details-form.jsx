'use strict';
const Actions = require('./actions');
const Alert = require('../../../components/alert.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const Editor = require('../../../components/turtle-editor.jsx');


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
            editedRml: props.rml,
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

        this.setState({
            'edition': Object.assign({}, this.state.edition, {
                comment: ''
            })
        });
        Actions.saveDetails(this.props._id.template,this.props._id.lang, data);
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

            <Editor content={this.state.editedRml}
                    onChange={this.onChange.bind(this)} readOnly={true}/>

        </div>;

        const formElements = <fieldset>

            {alerts}

            {editElements}


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
