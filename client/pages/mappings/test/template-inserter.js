/**
 * Created by ismaro3 on 21/07/17.
 */
'use strict';
const React = require('react');
const RowTemplateMapping = require('./row-template-mapping');

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
            <RowTemplateMapping onClose={this.onChildClose.bind(this)}/>
            <span>{JSON.stringify(this.state.result,null,2)}</span>
        </div>);


    }


}

//TemplateInserter.propTypes = propTypes;


module.exports = TemplateInserter;
