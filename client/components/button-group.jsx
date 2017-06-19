/* eslint-disable hapi/hapi-scope-start */
'use strict';

const Spinner = require('./form/spinner.jsx');
const PropTypes = require('prop-types');
const React = require('react');


const propTypes = {
    buttons: PropTypes.array,
    float: PropTypes.string
};


class ButtonGroup extends React.Component {


    render() {

        const buttonElems = [];
        this.props.buttons.forEach(

            (b) => {

                const but =  <button ref={b.ref} key={b.text} type="button" className={'btn ' + b.type} onClick={b.action} disabled={b.disabled}>
                    {b.text}
                    <Spinner space="left" show={b.loading} />

                </button>;



                buttonElems.push(but);


            });

        return (

            <div className="btn-group" style={{ float: this.props.float }}>
                {buttonElems}
            </div>

        );
    }
}

ButtonGroup.propTypes = propTypes;


module.exports = ButtonGroup;
