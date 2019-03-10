/* eslint-disable hapi/hapi-scope-start */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const ClassSearcherInput = require('./classSearcherInput.jsx');
const propTypes = {
    onSubmit: PropTypes.func //To call when button is clicked
};

class ClassSearcher extends React.Component {
    constructor(){
        super();
        this.state = {
            value: ''
        };
    }

    onChange(event){
        this.setState({ value: event.target.value });
    };

    onSubmit(){
        this.props.onSubmit(this.state.value);
    }

    render() {
        return (
            <div>
                    <div className="row">
                        <div className="col-sm-12">
                            <ClassSearcherInput
                                onChange={this.onChange.bind(this)}
                                value={this.state.value}
                                placeholder="e.g: Artist"
                                className="form-control"
                            />

                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <button
                                className="btn btn-primary btn-block"
                                type="button"
                                onClick={this.onSubmit.bind(this)}>Insert property</button>
                        </div>
                    </div>
            </div>
        );
    }
}
ClassSearcher.propTypes = propTypes;
module.exports = ClassSearcher;
