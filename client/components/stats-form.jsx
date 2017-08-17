'use strict';

const ControlGroup = require('./form/control-group.jsx');

const PropTypes = require('prop-types');
const React = require('react');
const Moment = require('moment');


const propTypes = {

    timeCreated: PropTypes.string,
    timeLastLogin: PropTypes.string
};


class StatsForm extends React.Component {



    render() {


        return (
            <fieldset>
                <legend>Stats</legend>

                <ControlGroup hideLabel={true} hideHelp={true}>
                    <span className="group-list"><b>Created:</b> {Moment(this.props.timeCreated).format('DD/MM/YYYY, HH:mm:ss') }</span>
                </ControlGroup>

                <ControlGroup hideLabel={true} hideHelp={true}>
                    <span className="group-list"><b>Last log-in:</b> {Moment(this.props.timeLastLogin).format('DD/MM/YYYY, HH:mm:ss') }</span>
                </ControlGroup>






            </fieldset>



        );
    }
}

StatsForm.propTypes = propTypes;


module.exports = StatsForm;
