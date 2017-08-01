/**
 * Created by ismaro3 on 21/07/17.
 * IntermediateTemplate
 */
'use strict';
const React = require('react');
const PropTypes = require('prop-types');
const Collapse = require('react-bootstrap').Collapse;
const ClassSearchInput = require('../../../../components/ontologySearcher/classSearcherInput.jsx');
const PropertySearchInput = require('../../../../components/ontologySearcher/propertySearcherInput.jsx');

const ButtonGroup = require('../../../../components/button-group.jsx');
const TemplateList = require('./TemplateList');
const propTypes = {
    onClose: PropTypes.func,
    childLevel: PropTypes.number,
    content: PropTypes.object
};

const name = 'IntermediateTemplate';
const required = ['class','property'];
const possibleChildren = ['SimplePropertyTemplate','GeocoordinateTemplate','StartDateTemplate', 'EndDateTemplate','ConstantTemplate','IntermediateTemplate','ConditionalTemplate'];

/**
 * Possible children: PropertyMapping, IntermediateNodeMapping, CustomMapping
 */
class RowIntermediateTemplate extends React.Component {


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
                    property: '',
                    templates: []
                },
                _alias: 'Empty' //This attribute should be removed before POST
            },
            errors: {

            },
            hasChild: false,
            childType: '',
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


    /**
     * Returns the current child component, and empty if none.
     * Called by: this method.
     */
    currentChild(){

        if (!this.state.hasChild){
            return undefined;
        }

        if (this.state.editingChild >= 0){
            return React.createFactory(require('./' + this.state.childType))({
                onClose: this.onEditedChildClose.bind(this,this.state.editingChild),
                childLevel: this.props.childLevel + 1,
                ref: "child",
                content: this.state.content.parameters.templates[this.state.editingChild]
            });
        }

        return React.createFactory(require('./' + this.state.childType))({ onClose: this.onChildClose.bind(this), ref: "child", childLevel: this.props.childLevel + 1 });


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
        c.childType = undefined;            //Erase child type
        c.editingChild = undefined;
        c.isCollapsed = false;
        this.setState(c);                   //Set state
        this.refs.child.eraseState();

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
        this.refs.child.eraseState();

    }

    createAlias(){

        return name + ' (' + this.state.content.parameters.property + ')';
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
            if ((typeof field === 'string' || field instanceof Array) && field.trim().length === 0 ){
                errors[fieldName] = true;
                hasError = true;
            }
            if (Object.keys(field).length === 0 && field.constructor === Object){
                errors[fieldName] = true;
                hasError = true;
            }
        }

        this.setState({ errors });
        if (save && hasError){
            return;
        }

        if (!save) {
            return window.confirm('Are you sure? Data can\'t be recovered.') && this.props.onClose(save,name,this.state.content);
        }

        const c = { ...this.state.content };
        c._alias = this.createAlias();
        this.props.onClose(save,name,c);



    }

    eraseState(){
        this.setState(this.getNewState());
    }

    /**
     * Removes a template from the children template list
     */
    removeTemplate(index){

        const c = { ...this.state.content };
        c.parameters.templates.splice(index,1);
        this.setState({ content:c });
    }

    toggleCollapse(){

        this.setState({ isCollapsed: !this.state.isCollapsed });
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

            <div style={{ marginLeft: this.props.childLevel * 5 + 'px' }}>
                <div className={'templateEditRow panel panel-default'}>
                    <div className="panel-heading clearfix">

                        <h5 className="panel-title pull-left" style={{ paddingTop: '7.5px' }}>
                            {
                                this.state.hasChild &&
                                <a href="#" onClick={this.toggleCollapse.bind(this)}>
                                    <i className={'fa ' + 'fa-arrow-' + (this.state.isCollapsed ? 'down' : 'up')}></i>
                                    &nbsp;Intermediate Template
                                </a>
                            }
                            {
                                !this.state.hasChild &&
                                <span>Intermediate Template</span>
                            }

                        </h5>

                        <ButtonGroup float='right' buttons={buttons}  />
                    </div>
                    <Collapse in={!this.state.isCollapsed}>
                        <div className={'panel-body ' + (this.state.hasChild ? 'disabled' : '')}>
                            {Object.keys(this.state.errors).length > 0 &&
                            <div><span style={{ color:'red' }}>Please, fill all the required fields (*)</span><br/><br/></div>}
                            <div className="row">

                                <div className="col-sm-6"> {/* Column of properties */}

                                    <form className="form-horizontal" onSubmit={(event) => event.preventDefault()}>
                                        <div className="form-group">
                                            <label className="control-label col-sm-2" htmlFor="class">Ontology class{required.indexOf('class') > -1 ? '*' : ''}:</label>
                                            <div className="col-sm-10">
                                                <ClassSearchInput
                                                       className={'form-control ' + (this.state.errors.class ? 'error' : '')}
                                                       id="class"
                                                       placeholder="e.g. dbo:Place"
                                                       value={this.state.content.parameters.class}
                                                       onChange={this.handleChange.bind(this,'class')}/>
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="control-label col-sm-2" htmlFor="property">Ontology property{required.indexOf('property') > -1 ? '*' : ''}:</label>
                                            <div className="col-sm-10">
                                                <PropertySearchInput
                                                       className={'form-control ' + (this.state.errors.property ? 'error' : '')}
                                                       id="property"
                                                       placeholder="e.g. resting_place"
                                                       value={this.state.content.parameters.property}
                                                       onChange={this.handleChange.bind(this,'property')}/>
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

RowIntermediateTemplate.propTypes = propTypes;


module.exports = RowIntermediateTemplate;
