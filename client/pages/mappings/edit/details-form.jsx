'use strict';
const Actions = require('./actions');
const Alert = require('../../../components/alert.jsx');
const Button = require('../../../components/form/button.jsx');
const LinkState = require('../../../helpers/link-state');
const TemplateList = require('./templateList.jsx');
const Moment = require('moment');
const PropTypes = require('prop-types');
const React = require('react');
const Spinner = require('../../../components/form/spinner.jsx');
const Editor = require('../../../components/turtle-editor.jsx');


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
    showSaveSuccess: PropTypes.bool,
    templateObject: PropTypes.object,
    onChange: PropTypes.func
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
            templateObject: {}
        };
    }

    onChange(newValue) {

        this.setState({ rml:newValue });
        this.props.onChange(newValue);
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


    insertTextAtCursor(value){

        editorRef.session.insert(editorRef.getCursorPosition(), value);


    };

    setText(text) {

        //Changes can be undone
        editorRef.session.doc.setValue(text,0);
        this.setState({ rml: text });
    }

    getCurrentText(){

        return this.state.rml;
    }

    onEditorLoad(editor){

        editorRef = editor;
        editorRef.$blockScrolling = Infinity;
    }

    changeView(showRML){
        if(!showRML){
            Actions.getTemplatesFromRML(this.props._id.template,this.props._id.lang,this.state.rml);
        }
        if(showRML){
            editorRef.focus();
            editorRef.navigateRight(0); //Workaround to fix problem with focusing again in ace editor
        }
        this.setState({showRML});
    }

    render() {

        let templateList = [];
        if(this.props.templateObject && this.props.templateObject.templates){
            this.props.templateObject.templates.forEach((t,i) => {
                templateList.push(
                    <TemplateList key={i} template={t} loading={this.props.templatesLoading}/>
                );
            });
        }

        if (templateList.length === 0) {
            templateList = <span><i>No templates found in code.</i></span>
        }



        const alerts = [];

        if (this.props.showSaveSuccess) {
            alerts.push(<Alert
                key="success"
                type="success"
                onClose={Actions.hideDetailsSaveSuccess}
                message={'Mapping saved successfully ' + (this.props.msg ? '(' + this.props.msg + ')' : '')}
            />);
        }

        if (this.props.error) {
            alerts.push(<Alert
                key="danger"
                type="danger"
                message={this.props.error}
                onClose={Actions.hideError}
            />);
        }

        const tabs =
            <ul className="nav nav-tabs edition-tabs">
                <li onClick={this.changeView.bind(this,true)} className={this.state.showRML  ? 'active' : ''}><a href="#">Edit RML</a></li>
                {(this.state.rml && this.state.rml.trim().length > 0) && <li onClick={this.changeView.bind(this,false)}
                    className={!this.state.showRML ? 'active' : ''}>
                    <a href="#">List templates</a>
                </li> }
            </ul>;


        const editElements = <div>
            <div className="row editionComment">
                <div className="col-sm-9">

                        <input type="text"
                               name="edition.comment"
                               maxLength="140"
                               value={this.state.edition.comment}
                               onChange={LinkState.bind(this)}
                               className="form-control" placeholder="Type edition comment (optional, max 140 char)"/>

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

            {tabs}

                <div style={{display: (this.state.showRML ? '' :  'none')}}>
                <Editor content={this.state.editedRml}
                        ref="editor"
                        id="mainEditor"
                        canExternallyChange={false}
                        onLoad={this.onEditorLoad.bind(this)}
                        onChange={this.onChange.bind(this)}/>
            {this.props && <span>Last edited on { Moment(this.props.edition.date).format('DD/MM/YYYY, HH:mm:ss') } by { this.props.edition.username}</span>}
            {this.props.hydrated && <span><br/>Edition comment: {this.props.oldComment}</span>}
            {this.props.edition.comment}
                </div>

            {/*Show error if any*/}
            {this.props.error &&
                <span><i>There are some errors in your code. Please fix them.</i></span>}


            {!this.state.showRML &&

            (
                (this.props.templatesLoading && (<span><i className="fa fa-refresh fa-spin"></i> Loading...</span>))
                || (!this.props.templatesLoading && templateList))


            }




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
