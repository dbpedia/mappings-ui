'use strict';
const PropTypes = require('prop-types');
const React = require('react');
const Moment = require('moment');

const propTypes = {
    data: PropTypes.array,
    showDetailedError: PropTypes.func
};


const calculateDuration = function (record) {

    if (!record.endDate || !record.startDate) {
        return '-';
    }

    return Moment.utc(Moment(record.endDate).diff(Moment(record.startDate))).format('HH:mm:ss');

};

const rowBackground = function (record) {

    try {
        if (!record.startDate) {
            return 'danger';
        }

        if (record.status.error) {
            return 'danger';
        }

        if (!record.endDate) {
            return 'warning';
        }

        return 'success';
    }
    catch (err) {
        return 'danger';
    }
};

const statusIcon = function (record) {

    try {
        if (!record.startDate) {
            return <i className="fa fa-times" aria-hidden="true"></i>;
        }

        if (record.status.error) {
            return <i className="fa fa-times" aria-hidden="true"></i>;
        }

        if (!record.endDate) {
            return <i className="fa fa-refresh fa-spin"></i>;
        }

        return <i className="fa fa-check"></i>;
    }
    catch (err) {
        return <i className="fa fa-times" aria-hidden="true"></i>;
    }

};

class Results extends React.Component {
    render() {

        const rows = this.props.data.map((record) => {

            return (
                <tr key={record._id} className={ rowBackground(record) }>

                    <td>{statusIcon(record)}</td>
                    <td>{Moment(record.startDate).format('DD/MM hh:mm:ss') }</td>
                    <td>{calculateDuration(record)}</td>
                    <td>{record.status.message}</td>
                    <td><span
                        className="btn btn-default btn-sm"
                        onClick={this.props.showDetailedError.bind(this,record)}>

                        <i className="fa fa-info-circle" aria-hidden="true"></i>

                    </span></td>
                </tr>
            );
        });

        return (
            <div className="table-responsive">
                <table className="table table-striped table-results">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Start time</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}

Results.propTypes = propTypes;


module.exports = Results;
