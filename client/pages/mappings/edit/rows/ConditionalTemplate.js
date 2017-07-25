/**
 * Created by ismaro3 on 21/07/17.
 * ConditionalTemplate
 */
'use strict';
const React = require('react');
const PropTypes = require('prop-types');
const Collapse = require('react-bootstrap').Collapse;
const ButtonGroup = require('../../../../components/button-group.jsx');
const TemplateList = require('./TemplateList');
const propTypes = {
    onClose: PropTypes.func,
    childLevel: PropTypes.number,
    content: PropTypes.object
};

const name = 'ConditionalTemplate';
const required = ['class'];
const possibleChildren = ['SimplePropertyTemplate','GeocoordinateTemplate','StartDateTemplate', 'EndDateTemplate','ConstantTemplate','IntermediateTemplate','ConditionalTemplate'];

/**
 * Possible children: PropertyMapping, IntermediateNodeMapping, CustomMapping
 */
class RowConditionalTemplate extends React.Component {


    //this.state.content has TemplateMapping content
    constructor(props){

        super(props);
        this.state = this.getNewState();


        //In edit mode
        if (this.props.content) {
            this.state.content = this.props.content;
        }

    }

    getNewState(){

        return  {
            content: {
                name,
                parameters: {
                    class: '',
                    templates: [],
                    fallback: null,
                    condition: {
                        operator: '',
                        parameters: {
                            property: '',
                            value: ''
                        }
                    }
                },
                _alias: 'Empty' //This attribute should be removed before POST
            },
            errors: {

            },
            hasChild: false,
            childType: '',
            hasFallback: false,
            editingChild: undefined,
            isCollapsed: false

        };
    }


    /**
     * To handle inputs.
     */
    handleChange(attribute,event){

        const value = event.target.value;
        const content = { ...this.state.content };
        content.parameters[attribute] = value;
        this.setState({ content });

    }

    handleOperatorChange(event){

        const value = event.target.value;
        const content = { ...this.state.content };
        content.parameters.condition.operator = value;
        this.setState({ content });

    }

    handleConditionParametersChange(attribute,event){

        const value = event.target.value;
        const content = { ...this.state.content };
        content.parameters.condition.parameters[attribute] = value;
        this.setState({ content });

    }

    /**
     * Used to show a new child of a certain type.
     * Called by: this method.
     */
    showChild(type){

        this.setState({ hasChild:true,childType:type,isCollapsed: true });
        //When hasChild = true, the div is disabled

    }

    showEditChild(type,index){

        this.setState({ hasChild:true,childType:type,editingChild:index,isCollapsed: true });
        //When hasChild = true, the div is disabled

    }

    showFallbackChild(){

        this.setState({ hasChild:true,hasFallback: true,childType:'ConditionalTemplate',isCollapsed: true });
        //When hasChild = true, the div is disabled

    }

    editFallbackChild(){

        this.setState({ hasChild:true,hasFallback: true, editingFallback: true,childType:'ConditionalTemplate',isCollapsed: true });
        //When hasChild = true, the div is disabled

    }


    /**
     * Returns the current child component, and empty if none.
     * Called by: this method.
     */
    currentChild(){

        if (!this.state.hasChild){
            return undefined;
        }

        if (this.state.hasFallback){
            if (this.state.editingFallback){
                return React.createFactory(require('./' + this.state.childType))({
                    onClose: this.onFallbackChildClose.bind(this),
                    childLevel: this.props.childLevel + 1,
                    content: this.state.content.parameters.fallback });
            }
            return React.createFactory(require('./' + this.state.childType))({ onClose: this.onFallbackChildClose.bind(this), childLevel: this.props.childLevel + 1 });
        }


        if (this.state.editingChild >= 0){
            return React.createFactory(require('./' + this.state.childType))({
                onClose: this.onEditedChildClose.bind(this,this.state.editingChild),
                childLevel: this.props.childLevel + 1,
                content: this.state.content.parameters.templates[this.state.editingChild]
            });
        }

        return React.createFactory(require('./' + this.state.childType))({ onClose: this.onChildClose.bind(this), childLevel: this.props.childLevel + 1 });


    }




    /**
     * Called when child saves it state, so we incorporate its state into ours.
     * If save = true, incorporates state. Else, nothing.
     * Called by: child.
     */
    onChildClose(save,childType,content){

        const c = { ...this.state.content };
        if (save){
            c.parameters.templates.push(content);       //Add child content as mapping
        }
        c.hasChild = false;                 //Kill child
        c.hasFallback = false;
        c.editingChild = undefined;
        c.childType = undefined;            //Erase child type
        c.isCollapsed = false;
        this.setState(c);                   //Set state

    }

    onEditedChildClose(index,save,childType,content){

        const c = { ...this.state.content };
        if (save){
            c.parameters.templates[index] = content;       //Add child content as mapping
        }
        c.hasChild = false;                 //Kill child
        c.hasFallback = false;
        c.editingChild = undefined;
        c.isCollapsed = false;
        c.childType = undefined;            //Erase child type
        this.setState(c);                   //Set state

    }



    onFallbackChildClose(save,childType,content){

        const c = { ...this.state.content };
        if (save){
            c.parameters.fallback = content;       //Add child content as mapping
        }
        c.hasChild = false;                 //Kill child
        c.hasFallback = false;
        c.isCollapsed = false;
        c.childType = undefined;            //Erase child type
        this.setState(c);                   //Set state

    }


    createAlias(){

        return name + ' (' + this.state.content.parameters.class + ')';
    }

    /**
     * Called when this mapping is closed.
     * Called by: this component.
     */
    onMeClose(save){

        const errors = {};
        let hasError = false;
        for (let i = 0; i < required.length; ++i){
            const field = this.state.content.parameters[required[i]];
            const fieldName = required[i];
            if (!field){
                errors[fieldName] = true;
                hasError = true;
            }
            else if ((typeof field === 'string' || field instanceof Array) && field.trim().length === 0 ){
                errors[fieldName] = true;
                hasError = true;
            }
            else if (Object.keys(field).length === 0 && field.constructor === Object){
                errors[fieldName] = true;
                hasError = true;
            }
        }

        if (save && hasError){
            this.setState({ errors });
            return;
        }


        if (!save) {
            return window.confirm('Are you sure? Data can\'t be recovered.') && this.props.onClose(save,name,this.state.content);
        }

        //Todo: Check certain conditions, such as put condition to null when empty, check that if operator is set,
        //then other things have to be set...
        const c = { ...this.state.content };
        c._alias = this.createAlias();
        this.setState(this.getNewState(), () => {

            return this.props.onClose(save,name,c);
        });


    }

    /**
     * Removes a template from the children template list
     */
    removeTemplate(index){

        const c = { ...this.state.content };
        c.parameters.templates.splice(index,1);
        this.setState({ content:c });
    }

    removeFallback(){

        const allowed = window.confirm('Are you sure? Fallback data can\'t be recovered.');

        if (!allowed) {
            return;
        }
        const c = { ...this.state.content };
        c.parameters.fallback = null;
        this.setState({ content:c });
    }

    toggleCollapse(){

        this.setState({ isCollapsed: !this.state.isCollapsed });
    }

    operatorSelectHandler(event){

        const content = { ...this.state.content };
        content.parameters.condition.operator = event.target.value;
        this.setState({ content });

    }

    render(){

        const buttons = [
            { type: 'btn-success',
                text: <span><i className="fa fa-check" aria-hidden="true"></i>&nbsp;{this.props.childLevel === 0 ? 'Save' : 'OK'}</span>,
                action: this.onMeClose.bind(this,true),
                sizeClass: 'btn-sm',
                disabled: this.state.hasChild
            },
            { type: 'btn-danger',
                text: <span><i className="fa fa-times" aria-hidden="true"></i>&nbsp;Cancel</span>,
                action: this.onMeClose.bind(this,false),
                sizeClass: 'btn-sm',
                disabled: this.state.hasChild
            }
        ];


        return (

            <div style={ { marginLeft: this.props.childLevel * 5 + 'px' } }>
                <div className={'templateEditRow panel panel-default'}>
                    <div className="panel-heading clearfix">



                            <h5 className="panel-title pull-left" style={{ paddingTop: '7.5px' }}>
                                {
                                    this.state.hasChild &&
                                    <a href="#" onClick={this.toggleCollapse.bind(this)}>
                                        <i className={'fa ' + 'fa-arrow-' + (this.state.isCollapsed ? 'down' : 'up')}></i>
                                        &nbsp;Conditional Template
                                    </a>
                                }
                                {
                                    !this.state.hasChild &&
                                    <span>Conditional Template</span>
                                }

                            </h5>



                        <ButtonGroup float='right' buttons={buttons}  />
                    </div>
                    <Collapse in={!this.state.isCollapsed}>
                    <div className={'panel-body ' + (this.state.hasChild ? 'disabled' : '')}>
                        {Object.keys(this.state.errors).length > 0 &&
                        <div><span style={{ color:'red' }}>Please, fill all the required fields (*)</span><br/><br/></div>}

                        {/* Class name */}
                        <div className="row">
                            <div className="col-sm-6">
                                <form onSubmit={(event) => event.preventDefault()}>
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="class">Class{required.indexOf('class') > -1 ? '*' : ''}</label>
                                        <div className="col-sm-10">
                                            <input type="text"
                                                   className={'form-control ' + (this.state.errors.class ? 'error' : '')}
                                                   id="class"
                                                   placeholder="e.g. dbo:Person"
                                                   value={this.state.content.parameters.class}
                                                   onChange={this.handleChange.bind(this,'class')}/>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="col-sm-6">
                                <form onSubmit={(event) => event.preventDefault()}>
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="fallback">Fallback{required.indexOf('fallback') > -1 ? '*' : ''}</label>
                                        <div className="col-sm-10">
                                            {!this.state.content.parameters.fallback &&
                                            <div className="col-sm-10">

                                                <span>None (<a href="#" onClick={this.showFallbackChild.bind(this)}>Set</a>)</span>
                                            </div>
                                            }
                                            {this.state.content.parameters.fallback &&
                                            <div className="col-sm-10">

                                                <span>{this.state.content.parameters.fallback.parameters.class}
                                                    &nbsp;( <a href="#" onClick={this.editFallbackChild.bind(this)}>Edit</a> -
                                              <a href="#" onClick={this.removeFallback.bind(this)}>Remove</a> )
                                        </span>
                                            </div>
                                            }
                                        </div>
                                    </div>
                                </form>
                            </div>

                        </div>



                        <hr/>
                        <div className="row">

                            {/* Condition */}
                            <div className="col-sm-6">

                                <h4>Condition</h4>
                                <form className="form-horizontal" onSubmit={(event) => event.preventDefault()}>
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="operator">Operator{required.indexOf('operator') > -1 ? '*' : ''}</label>
                                        <div className="col-sm-10">
                                            <select className="form-control" value={this.state.content.parameters.condition.operator} onChange={this.operatorSelectHandler.bind(this)}>
                                                <option value="">-</option>
                                                <option value="isSet">isSet</option>
                                                <option value="equals">equals</option>
                                                <option value="contains">contains</option>
                                                <option value="otherwise">otherwise</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="property">Property{required.indexOf('property') > -1 ? '*' : ''}</label>
                                        <div className="col-sm-10">
                                            <input type="text"
                                                   className={'form-control ' + (this.state.errors.property ? 'error' : '')}
                                                   id="property"
                                                   placeholder='e.g. name'
                                                   value={this.state.content.parameters.condition.parameters.property}
                                                   onChange={this.handleConditionParametersChange.bind(this,'property')}/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="value">Value{required.indexOf('value') > -1 ? '*' : ''}</label>
                                        <div className="col-sm-10">
                                            <input type="text"
                                                   className={'form-control ' + (this.state.errors.value ? 'error' : '')}
                                                   id="value"
                                                   placeholder='e.g. Jon Smith'
                                                   value={this.state.content.parameters.condition.parameters.value}
                                                   onChange={this.handleConditionParametersChange.bind(this,'value')}/>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            <div className="col-sm-6"> {/* Column of mappings */}
                                <TemplateList
                                    hasError={this.state.errors.templates}
                                    required={required.indexOf('templates') > -1}
                                    possibleOptions={possibleChildren}
                                    templates={this.state.content.parameters.templates}
                                    onAdd={this.showChild.bind(this)}
                                    onEdit={this.showEditChild.bind(this)}
                                    onRemove={this.removeTemplate.bind(this)}
                                />
                            </div>
                        </div>
                    </div>
                </Collapse>
                </div>
                {this.currentChild()}
            </div>


        );
    }


}

RowConditionalTemplate.propTypes = propTypes;


module.exports = RowConditionalTemplate;
