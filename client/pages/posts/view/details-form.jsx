'use strict';
const Alert = require('../../../components/alert.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const ReactMarkdown = require('react-markdown');

const propTypes = {
    postId: PropTypes.string,
    title: PropTypes.string,
    markdown: PropTypes.string,
    error: PropTypes.string,
    hasError: PropTypes.object,
    help: PropTypes.object,
    loading: PropTypes.bool
};

class DetailsForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props.title,
            markdown: props.markdown
        };
    }

    render() {
        const alerts = [];
        if (this.props.error) {
            alerts.push(<Alert
                key="danger"
                type="danger"
                message={this.props.error}
            />);
        }

        const formElements = <fieldset>
            {alerts}
            <ReactMarkdown source={this.state.markdown ? this.state.markdown : ''} />
            { (!this.state.markdown || this.state.markdown.length === 0) &&
                <i>This page is empty.</i>
            }
        </fieldset>;

        return (
            <form>
                {formElements}
            </form>
        );
    }
}
DetailsForm.propTypes = propTypes;
module.exports = DetailsForm;
