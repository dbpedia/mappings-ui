/**
 * Created by ismaro3 on 24/07/17.
 * EndDateTemplate
 */
'use strict';
const React = require('react');
const PropTypes = require('prop-types');
const ButtonGroup = require('../../../../components/button-group.jsx');
const PropertySearchInput = require('../../../../components/ontologySearcher/propertySearcherInput.jsx');

const propTypes = {
    onClose: PropTypes.func,
    childLevel: PropTypes.number,
    content: PropTypes.object
};

const name = 'EndDateTemplate';
const required = ['ontologyProperty','property'];

/**
 * Possible children: None
 */
class RowEndDateTemplate extends React.Component {


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
                    ontologyProperty: '',
                    property: ''
                },
                _alias: 'Empty' //This attribute should be removed before POST
            },
            errors: {

            }

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
                        <h5 className="panel-title pull-left" style={{ paddingTop: '7.5px' }}>End Date Template</h5>
                        <ButtonGroup float='right' buttons={buttons}  />
                    </div>
                    <div className={'panel-body ' + (this.state.hasChild ? 'disabled' : '')}>
                        {Object.keys(this.state.errors).length > 0 &&
                        <div><span style={{ color:'red' }}>Please, fill all the required fields (*)</span><br/><br/></div>}
                        <div className="row">

                            <div className="col-sm-6"> {/* Column of properties */}

                                <form className="form-horizontal" onSubmit={(event) => event.preventDefault()}>
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="ontologyProperty">Ontology Property{required.indexOf('ontologyProperty') > -1 ? '*' : ''}</label>
                                        <div className="col-sm-10">
                                            <PropertySearchInput
                                                   className={'form-control ' + (this.state.errors.ontologyProperty ? 'error' : '')}
                                                   id="ontologyProperty"
                                                   placeholder='e.g. dbo:endYear'
                                                   value={this.state.content.parameters.ontologyProperty}
                                                   onChange={this.handleChange.bind(this,'ontologyProperty')}/>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="col-sm-6"> {/* Column of mappings */}
                                <form className="form-horizontal" onSubmit={(event) => event.preventDefault()}>
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="property">Property{required.indexOf('property') > -1 ? '*' : ''}</label>
                                        <div className="col-sm-10">
                                            <input type="text"
                                                   className={'form-control ' + (this.state.errors.property ? 'error' : '')}
                                                   id="property"
                                                   placeholder='e.g. years_active'
                                                   value={this.state.content.parameters.property}
                                                   onChange={this.handleChange.bind(this,'property')}/>
                                        </div>
                                    </div>

                                </form>
                            </div>

                        </div>


                    </div>
                </div>
            </div>


        );
    }


}

RowEndDateTemplate.propTypes = propTypes;


module.exports = RowEndDateTemplate;
