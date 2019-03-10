/**
 * Created by ismaro3 on 24/07/17.
 * SimplePropertyTemplate
 */
'use strict';
const React = require('react');
const PropTypes = require('prop-types');
const ButtonGroup = require('../../../../components/button-group.jsx');
const PropertySearchInput = require('../../../../components/ontologySearcher/propertySearcherInput.jsx');
const DatatypeSearchInput =  require('../../../../components/ontologySearcher/datatypeSearcherInput.jsx');

const propTypes = {
    onClose: PropTypes.func,
    childLevel: PropTypes.number,
    content: PropTypes.object
};
const name = 'SimplePropertyTemplate';
const required = ['ontologyProperty','property'];

/**
 * Possible children: None.
 */
class RowSimplePropertyTemplate extends React.Component {
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
                    property: '',
                    select: '',
                    prefix: '',
                    suffix: '',
                    transform: '',
                    unit: '',
                    factor: ''
                },
                _alias: 'Empty' //This attribute should be removed before POST
            },
            errors: {

            },
            showOptional: false

        };
    }

    parametersSelectHandler(attribute,event){
        const content = { ...this.state.content };
        content.parameters[attribute] = event.target.value;
        this.setState({ content });
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

    eraseState(){
        this.setState(this.getNewState());
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

       /* this.setState(this.getNewState(), () => {

            return this.props.onClose(save,name,c);
        });*/
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
                        <h5 className="panel-title pull-left" style={{ paddingTop: '7.5px' }}>Simple Property Template</h5>
                        <ButtonGroup float='right' buttons={buttons}  />
                    </div>
                    <div className={'panel-body ' + (this.state.hasChild ? 'disabled' : '')}>
                        {Object.keys(this.state.errors).length > 0 &&
                        <div><span style={{ color:'red' }}>Please, fill all the required fields (*)</span><br/><br/></div>}

                        <div className="row">
                            <form className="form-horizontal" onSubmit={(event) => event.preventDefault()}>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="ontologyProperty">Ontology Property{required.indexOf('ontologyProperty') > -1 ? '*' : ''}</label>
                                        <div className="col-sm-10">
                                            <PropertySearchInput
                                                className={'form-control ' + (this.state.errors.ontologyProperty ? 'error' : '')}
                                                id="ontologyProperty"
                                                placeholder="e.g: name"
                                                value={this.state.content.parameters.ontologyProperty}
                                                onChange={this.handleChange.bind(this,'ontologyProperty')}/>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6">
                                    <div className="form-group">
                                        <label className="control-label col-sm-2" htmlFor="property">Property{required.indexOf('property') > -1 ? '*' : ''}</label>
                                        <div className="col-sm-10">
                                            <input type="text"
                                                   className={'form-control ' + (this.state.errors.property ? 'error' : '')}
                                                   id="property"
                                                   placeholder='e.g. name'
                                                   value={this.state.content.parameters.property}
                                                   onChange={this.handleChange.bind(this,'property')}/>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        {   !this.state.showOptional &&
                            <a href="#" onClick={() => {this.setState({ showOptional: true })}}>Show optional fields</a>
                        }
                        {   this.state.showOptional &&
                            <div>
                                <a href="#" onClick={() => {this.setState({ showOptional: false })}}>Hide optional fields</a>
                                <hr/>
                                <div className="row">
                                    <div className="col-sm-6"> {/* Column of properties */}

                                        <form className="form-horizontal" onSubmit={(event) => event.preventDefault()}>


                                            <div className="form-group">
                                                <label className="control-label col-sm-2" htmlFor="select">Select{required.indexOf('select') > -1 ? '*' : ''}</label>
                                                <div className="col-sm-10">
                                                    <select className="form-control" value={this.state.content.parameters.select} onChange={this.parametersSelectHandler.bind(this,'select')}>
                                                        <option value="">-</option>
                                                        <option value="first">first</option>
                                                        <option value="last">last</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="control-label col-sm-2" htmlFor="prefix">Prefix{required.indexOf('prefix') > -1 ? '*' : ''}</label>
                                                <div className="col-sm-10">
                                                    <input type="text"
                                                           className={'form-control ' + (this.state.errors.prefix ? 'error' : '')}
                                                           id="prefix"
                                                           placeholder=''
                                                           value={this.state.content.parameters.prefix}
                                                           onChange={this.handleChange.bind(this,'prefix')}/>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="control-label col-sm-2" htmlFor="suffix">Suffix{required.indexOf('suffix') > -1 ? '*' : ''}</label>
                                                <div className="col-sm-10">
                                                    <input type="text"
                                                           className={'form-control ' + (this.state.errors.suffix ? 'error' : '')}
                                                           id="suffix"
                                                           placeholder=''
                                                           value={this.state.content.parameters.suffix}
                                                           onChange={this.handleChange.bind(this,'suffix')}/>
                                                </div>
                                            </div>

                                        </form>
                                    </div>

                                    <div className="col-sm-6"> {/* Column of mappings */}
                                        <form className="form-horizontal" onSubmit={(event) => event.preventDefault()}>

                                            <div className="form-group">
                                                <label className="control-label col-sm-2" htmlFor="transform">Transform{required.indexOf('transform') > -1 ? '*' : ''}</label>
                                                <div className="col-sm-10">
                                                    <select className="form-control" value={this.state.content.parameters.transform} onChange={this.parametersSelectHandler.bind(this,'transform')}>
                                                        <option value="">-</option>
                                                        <option value="external">external</option>
                                                        <option value="internal">internal</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="control-label col-sm-2" htmlFor="unit">Unit{required.indexOf('unit') > -1 ? '*' : ''}</label>
                                                <div className="col-sm-10">
                                                    <DatatypeSearchInput
                                                           className={'form-control ' + (this.state.errors.unit ? 'error' : '')}
                                                           id="unit"
                                                           placeholder='e.g: milePerHour'
                                                           value={this.state.content.parameters.unit}
                                                           onChange={this.handleChange.bind(this,'unit')}/>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="control-label col-sm-2" htmlFor="prefix">Factor{required.indexOf('factor') > -1 ? '*' : ''}</label>
                                                <div className="col-sm-10">
                                                    <input type="number"
                                                           className={'form-control ' + (this.state.errors.factor ? 'error' : '')}
                                                           id="factor"
                                                           placeholder=''
                                                           value={this.state.content.parameters.factor}
                                                           onChange={this.handleChange.bind(this,'factor')}/>
                                                </div>
                                            </div>

                                        </form>
                                    </div>

                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}
RowSimplePropertyTemplate.propTypes = propTypes;
module.exports = RowSimplePropertyTemplate;
