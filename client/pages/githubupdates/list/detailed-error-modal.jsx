'use strict';
const Actions = require('./actions');
const Modal = require('../../../components/modal.jsx');
const PropTypes = require('prop-types');
const React = require('react');



const propTypes = {
    show: PropTypes.bool,
    record: PropTypes.object
};


class ShowDetailedError extends React.Component {

    constructor(props) {

        super(props);

    }



    render() {

        return (
            <Modal
                header="Update details"
                show={this.props.show}
                record={this.props.record}
                onClose={Actions.hideDetailedError}>

                {this.props.record &&

                    <div>
                        <b>Status: </b> {this.props.record.status.message}
                        <br/><br/>
                        <b>Detailed message: </b>
                        <br/>
                        {(this.props.record.status.longMessage && this.props.record.status.longMessage.length > 0) ? this.props.record.status.longMessage : <i>Empty</i>}
                    </div>


                }

            </Modal>
        );
    }
}

ShowDetailedError.propTypes = propTypes;


module.exports = ShowDetailedError;
