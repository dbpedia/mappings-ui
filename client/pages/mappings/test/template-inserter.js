/**
 * Created by ismaro3 on 21/07/17.
 */
'use strict';
const React = require('react');
const GeocoordinateTemplate = require('./rows/GeocoordinateTemplate');
const StartDateTemplate = require('./rows/StartDateTemplate');
const EndDateTemplate = require('./rows/EndDateTemplate');
const IntermediateTemplate = require('./rows/IntermediateTemplate');
const ConditionalTemplate = require('./rows/ConditionalTemplate');
class TemplateInserter extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            result: ''
        };
    }

    onChildClose(save,childType,content){

        this.setState({result:content});
    }



    render(){

        return (<div>
            <br/>
            <ConditionalTemplate onClose={this.onChildClose.bind(this)} childLevel={0}/>
            <span>{JSON.stringify(this.state.result,null,2)}</span>
        </div>);


    }


}

//TemplateInserter.propTypes = propTypes;


module.exports = TemplateInserter;
