'use strict';
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Link = ReactRouter.Link;
const Moment = require('moment');

const propTypes = {
    data: PropTypes.array,
    canRestore: PropTypes.bool,
    onRestore: PropTypes.func,
    onDelete: PropTypes.func,
    canDelete: PropTypes.bool
};

const rowBackground = function (record){
    if (record.ignore) {
        return 'row-disabled';
    }

    if (record.status.error) {
        return 'danger';
    }

    return '';
};

class Results extends React.Component {
    render() {
        const rows = this.props.data.map((record) => {
            return (
                <tr key={record._id.template} className={ rowBackground(record) }>
                    <td>{record._id.lang}</td>
                    <td>{record.templateFullName}</td>
                    <td>{record._id.version}</td>
                    <td>{record.deletion ? record.deletion.username + ', on ' + Moment(record.deletion.date).format('DD/MM hh:mm') : '-' }</td>
                    <td>{record.status.message}</td>
                    <td>
                        <Link
                            className="btn btn-default btn-sm btn-table"
                            to={`/mappings/history/view/${record._id.template}/${record._id.lang}/${record._id.version}`}>
                            <i className="fa fa-eye" aria-hidden="true"></i>
                        </Link>

                        { this.props.canRestore &&
                        <span
                            className="btn btn-default btn-sm btn-table"
                            onClick={() => this.props.onRestore(record._id.template,record._id.lang,record._id.version)}>
                                <i className="fa fa-history" aria-hidden="true"></i>
                            </span>
                        }

                        {this.props.canDelete &&
                            <span
                                className="btn btn-default btn-sm btn-table"
                                onClick={() => this.props.onDelete(record._id.template, record._id.lang)}>

                                <i className="fa fa-trash" aria-hidden="true"></i>
                            </span>
                        }

                    </td>
                </tr>
            );
        });

        return (
            <div className="table-responsive">
                <table className="table  table-results">
                    <thead>
                        <tr>
                            <th>Lang</th>
                            <th>Name</th>
                            <th>Last Version</th>
                            <th>Deletion</th>
                            <th>Status</th>
                            <th>Actions</th>
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
