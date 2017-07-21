/**
 * Created by ismaro3 on 21/07/17.
 */
'use strict';
const React = require('react');
const PropTypes = require('prop-types');
const RowIntermediateNodeMapping = require('./row-intermediate-node-mapping.js');

const propTypes = {
    onClose: PropTypes.func
};

/**
 * Possible children: IntermediateNodeMapping, PropertyMapping, CustomMapping
 */
class RowTemplateMapping extends React.Component {


    //this.state.content has TemplateMapping content
    constructor(props){

        super(props);
        this.state = {
            content: {
                type: 'TemplateMapping',
                mapToClass: 'a',
                correspondingClass: 'b',
                correspondingProperty: '',
                mappings: []
            },
            hasChild: false,
            childType: ''

        };

    }


    /**
     * To handle inputs.
     */
    handleChange(attribute,event){

        let value = event.target.value;
        let content = {...this.state.content};
        content[attribute] = value;
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


    /**
     * Returns the current child component, and empty if none.
     * Called by: this method.
     */
    currentChild(){

        if(!this.state.hasChild){
            return undefined;
        }

        if(this.state.childType === 'TemplateMapping') {
            return <RowTemplateMapping onClose={this.onChildClose.bind(this)}/>
        }

        if(this.state.childType === 'IntermediateNodeMapping') {
            return <RowIntermediateNodeMapping onClose={this.onChildClose.bind(this)}/>
        }

    }




    /**
     * Called when child saves it state, so we incorporate its state into ours.
     * If save = true, incorporates state. Else, nothing.
     * Called by: child.
     */
    onChildClose(save,childType,content){

        let c = {...this.state.content};
        if (save){
            c.mappings.push(content);       //Add child content as mapping
        }
        c.hasChild = false;                 //Kill child
        c.childType = undefined;            //Erase child type
        this.setState(c);                   //Set state

    }


    /**
     * Called when this mapping is closed.
     * Called by: this component.
     */
    onMeClose(save){
        this.props.onClose(save,'TemplateMapping',this.state.content);
    }


    render(){


        const mappingList = [];
        this.state.content.mappings.forEach((map,i) => {
           mappingList.push(<li key={i}>{map.type}</li>);
        });

        return (

            <div>
                <div className={'panel panel-default ' + (this.state.hasChild ? 'disabled' : '')}>
                    <div className="panel-heading">
                        Template Mapping
                        <button onClick={this.onMeClose.bind(this,true)}>Save</button>
                        <button onClick={this.onMeClose.bind(this,false)}>Cancel</button>
                    </div>
                    <div className="panel-body">
                        <div className="row">
                            <div className="col-sm-6">
                                mapToClass:
                                <input type="text" value={this.state.content.mapToClass} onChange={this.handleChange.bind(this,'mapToClass')}/>
                                <br/>
                                correspondingClass:
                                <input type="text" value={this.state.content.correspondingClass} onChange={this.handleChange.bind(this,'correspondingClass')}/>
                                <br/>
                                correspondingProperty:
                                <input type="text" value={this.state.content.correspondingProperty} onChange={this.handleChange.bind(this,'correspondingProperty')}/>
                                <br/>
                            </div>
                            <div className="col-sm-6">
                                mappings:
                                <ul>
                                    {mappingList}
                                </ul>
                                <button onClick={this.showChild.bind(this,'TemplateMapping')}>Add TemplateMapping</button>
                                <button onClick={this.showChild.bind(this,'IntermediateNodeMapping')}>Add IntermediateNodeMapping</button>
                            </div>
                        </div>
                    </div>


                </div>
                {this.currentChild()}
            </div>


        );
    }


}

RowTemplateMapping.propTypes = propTypes;


module.exports = RowTemplateMapping;
