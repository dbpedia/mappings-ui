/**
 * Created by ismaro3 on 21/07/17.
 * IntermediateTemplate
 */
'use strict';
const React = require('react');
const PropTypes = require('prop-types');
const ButtonGroup = require('../../../../components/button-group.jsx');
const TemplateList = require('../TemplateList');
const propTypes = {
    onClose: PropTypes.func,
    childLevel: PropTypes.number
};

const name = 'IntermediateTemplate';
const required = ['class','property'];
const possibleChildren = ['SimplePropertyTemplate','GeocoordinateTemplate','StartDateTemplate', 'EndDateTemplate','IntermediateTemplate','ConditionalTemplate'];

/**
 * Possible children: PropertyMapping, IntermediateNodeMapping, CustomMapping
 */
class RowIntermediateTemplate extends React.Component {


    //this.state.content has TemplateMapping content
    constructor(props){

        super(props);
        this.state = {
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
            editingChild: undefined

        };

        //In edit mode
        if (this.props.content) {
            this.state.content = this.props.content;
        }
    }


    /**
     * To handle inputs.
     */
    handleChange(attribute,event){

        let value = event.target.value;
        let content = {...this.state.content};
        content.parameters[attribute] = value;
        this.setState({content});

    }

    /**
     * Used to show a new child of a certain type.
     * Called by: this method.
     */
    showChild(type){

       this.setState({hasChild:true,childType:type});
       //When hasChild = true, the div is disabled

    }

    showEditChild(type,index){

        this.setState({hasChild:true,childType:type,editingChild:index});
        //When hasChild = true, the div is disabled

    }


    /**
     * Returns the current child component, and empty if none.
     * Called by: this method.
     */
    currentChild(){

        if(!this.state.hasChild){
            return undefined;
        }

        if(this.state.editingChild >= 0){
            return React.createFactory(require('./' + this.state.childType))({
                onClose: this.onEditedChildClose.bind(this,this.state.editingChild),
                childLevel: this.props.childLevel + 1,
                content: this.state.content.parameters.templates[this.state.editingChild]
            });
        }

        return React.createFactory(require('./' + this.state.childType))({onClose: this.onChildClose.bind(this), childLevel: this.props.childLevel + 1});


    }




    /**
     * Called when child saves it state, so we incorporate its state into ours.
     * If save = true, incorporates state. Else, nothing.
     * Called by: child.
     */
    onChildClose(save,childType,content){

        let c = {...this.state.content};
        if (save){
            c.parameters.templates.push(content);       //Add child content as mapping
        }
        c.hasChild = false;                 //Kill child
        c.childType = undefined;            //Erase child type
        c.editingChild = undefined;
        this.setState(c);                   //Set state

    }

    onEditedChildClose(index,save,childType,content){

        let c = {...this.state.content};
        if (save){
            c.parameters.templates[index] = content;       //Add child content as mapping

        }
        c.hasChild = false;                 //Kill child
        c.hasFallback = false;
        c.editingChild = undefined;
        c.childType = undefined;            //Erase child type
        this.setState(c);                   //Set state

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
        for(let i = 0; i < required.length ; i++){
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

        if (save && hasError){
            this.setState({errors});
            return;
        }


        if (!save) {
            return window.confirm("Are you sure? Data can't be recovered.") && this.props.onClose(save,name,this.state.content);
        }

        let c = {...this.state.content};
        c._alias = this.createAlias();
        this.setState({ content:c }, () => {
            return this.props.onClose(save,name,this.state.content);
        });


    }

    /**
     * Removes a template from the children template list
     */
    removeTemplate(index){
        let c = {...this.state.content};
        c.parameters.templates.splice(index,1);
        this.setState({content:c});
    }

    render(){

        const buttons = [
            { type: 'btn-success',
                text: <span><i className="fa fa-check" aria-hidden="true"></i>&nbsp;Save</span>,
                action: this.onMeClose.bind(this,true),
                sizeClass: 'btn-sm'
            },
            { type: 'btn-danger',
                text: <span><i className="fa fa-times" aria-hidden="true"></i>&nbsp;Cancel</span>,
                action: this.onMeClose.bind(this,false),
                sizeClass: 'btn-sm'
            }
        ];


        return (

            <div style={ {marginLeft: this.props.childLevel*5 + 'px'}}>
                <div className={'templateEditRow panel panel-default ' + (this.state.hasChild ? 'disabled' : '')}>
                    <div className="panel-heading clearfix">
                        <h5 className="panel-title pull-left" style={{paddingTop: '7.5px'}}>Conditional Template</h5>
                        <ButtonGroup float='right' buttons={buttons}  />
                    </div>
                    <div className="panel-body">
                        {Object.keys(this.state.errors).length > 0 &&
                        <div><span style={{color:"red"}}>Please, fill all the required fields (*)</span><br/><br/></div>}
                        <div className="row">

                            <div className="col-sm-6"> {/* Column of properties */}

                                <form className="form-horizontal" onSubmit={(event) => event.preventDefault()}>
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="class">Class{required.indexOf('class') > -1 ? '*' : ''}:</label>
                                        <div className="col-sm-10">
                                            <input type="text"
                                                   className={'form-control ' + (this.state.errors.class ? 'error' : '')}
                                                   id="class"
                                                   placeholder="e.g: dbo:Person"
                                                   value={this.state.content.parameters.class}
                                                   onChange={this.handleChange.bind(this,'class')}/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="property">Property{required.indexOf('property') > -1 ? '*' : ''}:</label>
                                        <div className="col-sm-10">
                                            <input type="text"
                                                   className={'form-control ' + (this.state.errors.property ? 'error' : '')}
                                                   id="property"
                                                   placeholder="e.g: dbo:BirthPlace"
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
                </div>
                {this.currentChild()}
            </div>


        );
    }


}

RowIntermediateTemplate.propTypes = propTypes;


module.exports = RowIntermediateTemplate;
