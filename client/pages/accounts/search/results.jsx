'use strict';
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');

const Link = ReactRouter.Link;
const propTypes = {
    data: PropTypes.array
};

class Results extends React.Component {
    render() {
        const rows = this.props.data.map((record) => {
            return (
                <tr key={record._id}>

                    <td>{record.username}</td>
                    <td>{record.name.first} {record.name.last}</td>
                    <td>{record.groups.admin ? 'Yes' : 'No'}</td>
                    <td>{record.isActive ? 'Enabled' : 'Disabled'}</td>
                    <td>
                        <Link
                            className="btn btn-default btn-sm"
                            to={`accounts/${record._id}`}>

                            <i className="fa fa-pencil" aria-hidden="true"></i>
                        </Link>
                    </td>
                </tr>
            );
        });

        return (
            <div className="table-responsive">
                <table className="table table-striped table-results">
                    <thead>
                        <tr>

                            <th >Username</th>
                            <th className="stretch">Name</th>
                            <th>Admin</th>
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
