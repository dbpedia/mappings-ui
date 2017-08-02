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
    error: PropTypes.string,
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
            this.insertTextAtCursor(' '); //Workaround to fix problem with focusing again in ace editor
        }
        this.setState({showRML});
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

        const tabs =
            <ul className="nav nav-tabs edition-tabs">
                <li onClick={this.changeView.bind(this,true)} className={this.state.showRML  ? 'active' : ''}><a href="#">Edit RML</a></li>
                <li onClick={this.changeView.bind(this,false)} className={!this.state.showRML ? 'active' : ''}><a href="#">List templates</a></li>
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
                        onLoad={this.onEditorLoad.bind(this)}
                        onChange={this.onChange.bind(this)}/>
            {this.props && <span>Last edited on { Moment(this.props.edition.date).format('DD/MM/YYYY, HH:mm:ss') } by { this.props.edition.username}</span>}
            {this.props.hydrated && <span><br/>Edition comment: {this.props.oldComment}</span>}
            {this.props.edition.comment}
                </div>


            {!this.state.showRML &&

                <TemplateList template={this.props.templateObject} loading={this.props.templatesLoading}/>

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
