/* eslint-disable hapi/hapi-scope-start */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const DatatypeSearcherInput = require('./datatypeSearcherInput.jsx');
const propTypes = {
    onSubmit: PropTypes.func //To call when button is clicked
};

class DatatypeSearcher extends React.Component {
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
                            <DatatypeSearcherInput
                                onChange={this.onChange.bind(this)}
                                value={this.state.value}
                                placeholder="e.g: milePerHour"
                                className="form-control"
                            />

                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <button
                                className="btn btn-primary btn-block"
                                type="button"
                                onClick={this.onSubmit.bind(this)}>Insert datatype</button>
                        </div>
                    </div>
            </div>
        );
    }
}

DatatypeSearcher.propTypes = propTypes;
module.exports = DatatypeSearcher;
