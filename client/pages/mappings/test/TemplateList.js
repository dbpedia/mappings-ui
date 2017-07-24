
'use strict';
const React = require('react');
const PropTypes = require('prop-types');
const propTypes = {
    hasError: PropTypes.bool,
    required: PropTypes.bool,
    possibleOptions: PropTypes.array,
    templates: PropTypes.array,
    onAdd: PropTypes.func,
    onEdit: PropTypes.func,
    onRemove: PropTypes.func
};

class TemplateList extends React.Component {

    constructor(props){

        super(props);
        this.state = {
            selectValue: this.props.possibleOptions[0]
        };


    }

    selectHandler(event){

        this.setState({ selectValue:event.target.value });

    }

    render(){

        const mappingListItems = [];
        this.props.templates.forEach((map,i) => {
            mappingListItems.push(
                <li className="list-group-item" key={i}>
                    {map._alias}
                    <span className="pull-right btn-group">
                         <button
                             className="btn btn-xs btn-warning"
                             onClick={this.props.onEdit.bind(this,map.name,i)}>
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                        </button>
                        &nbsp;
                        <button
                            className="btn btn-xs btn-danger"
                            onClick={this.props.onRemove.bind(this,i)}>
                            <i className="fa fa-times" aria-hidden="true"></i>
                        </button>

                    </span>
                </li>
            );
        });

        const options = [];
        this.props.possibleOptions.forEach((opt) => {
            options.push(<option key={opt} >{opt}</option>);
        });
        mappingListItems.push(
            <li className="list-group-item" key="addButton">
                <div className="input-group">
                    <select className="form-control" value={this.state.selectValue} onChange={(ev) => this.selectHandler(ev)}>
                        {options}
                    </select>
                    <span className="input-group-btn">
                    <button className="btn btn-basic" type="button" tabIndex="-1" onClick={this.props.onAdd.bind(this,this.state.selectValue)}>
                        <span><i className="fa fa-plus" aria-hidden="true"></i>&nbsp;Add template</span>
                    </button>
                </span>
                </div>
            </li>
        );

        return (
            <div>
                <h4>Templates{this.props.required ? '*' : ''}</h4>
                {this.props.hasError && <span style={{ color: 'red' }}>Please, add at least one children template.</span>}
                <ul className={'list-group'}>
                    {mappingListItems}
                </ul>
            </div>
        );


    }


}

TemplateList.propTypes = propTypes;


module.exports = TemplateList;
