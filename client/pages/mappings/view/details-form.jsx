'use strict';
const Actions = require('./actions');
const Alert = require('../../../components/alert.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const Editor = require('../../../components/turtle-editor.jsx');
const TemplateList = require('../edit/templateList.jsx');
const Moment = require('moment');


const propTypes = {
    _id: PropTypes.object,
    rml: PropTypes.string,
    version: PropTypes.number,
    edition: PropTypes.object,
    status: PropTypes.object,
    stats: PropTypes.object,
    error: PropTypes.any,
    hasError: PropTypes.object,
    help: PropTypes.object,
    loading: PropTypes.bool,
    templateObject: PropTypes.object,
    showSaveSuccess: PropTypes.bool,
    templatesLoading: PropTypes.bool,
    hydrated: PropTypes.bool,
    oldComment: PropTypes.string
};

let editorRef;
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
            stats: props.stats,
            showRML: true,
            templateObject: null
        };
    }


    changeView(showRML){

        if (!showRML && !this.props.templateObject){ //No need to refresh on view
            Actions.getTemplatesFromRML(this.props._id.template,this.props._id.lang,this.state.rml);
        }
        if (showRML){
            editorRef.focus();
            editorRef.navigateRight(0); //Workaround to fix problem with focusing again in ace editor
        }
        this.setState({ showRML });
    }

    onChange(newValue) {

        this.setState({ rml:newValue });
    }

    onVisibleChange(event){


        this.setState({ visible: event.target.value  === 'true' });
    }

    onEditorLoad(editor){

        editorRef = editor;
        editorRef.$blockScrolling = Infinity;
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

        let templateList = [];
        if (this.props.templateObject && this.props.templateObject.templates){
            this.props.templateObject.templates.forEach((t,i) => {

                templateList.push(
                    <TemplateList key={i} template={t} loading={this.props.templatesLoading}/>
                );
            });
        }

        if (templateList.length === 0) {
            templateList = <span><i>No templates found in code.</i></span>;
        }


        if (this.props.error) {
            templateList = '';
        }

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


        const editElements = <div style={{ display: (this.state.showRML ? '' :  'none') }}>

            <Editor content={this.state.editedRml} id="mainEditor"
                    onLoad={this.onEditorLoad.bind(this)}
                    onChange={this.onChange.bind(this)} readOnly={true}/>
            {this.props.hydrated && <span>Last edited on { Moment(this.props.edition.date).format('DD/MM/YYYY, HH:mm:ss') } by { this.props.edition.username}</span>}
            {this.props.hydrated && <span><br/>Edition comment: {this.props.oldComment}</span>}
            {this.props.edition.comment}

        </div>;

        const tabs =
            <ul className="nav nav-tabs edition-tabs">
                <li onClick={this.changeView.bind(this,true)} className={this.state.showRML  ? 'active' : ''}><a href="#">View RML</a></li>
                {(this.state.rml && this.state.rml.trim().length > 0) && <li onClick={this.changeView.bind(this,false)}
                                                                             className={!this.state.showRML ? 'active' : ''}>
                    <a href="#">List templates</a>
                </li> }
            </ul>;

        const formElements = <fieldset>

            {tabs}

            {alerts}

            {editElements}

            {/*Show error if any*/}
            {this.props.error &&
            <span><i>There are some errors in your code. Please fix them.</i></span>}


            {!this.state.showRML &&

            (
            (this.props.templatesLoading && (<span><i className="fa fa-refresh fa-spin"></i> Loading...</span>))
            || (!this.props.templatesLoading && templateList))


            }


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
