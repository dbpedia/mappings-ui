'use strict';
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Moment = require('moment');

const Link = ReactRouter.Link;
const propTypes = {
    data: PropTypes.array
};


class Results extends React.Component {
    render() {

        const rows = this.props.data.map((record) => {

            return (
                <tr key={record._id}>

                    <td>{record.title}</td>

                    <td>{record.creation.username}, on {Moment(record.creation.time).format('DD/MM') }</td>
                    <td>{record.lastEdition.username}, on {Moment(record.lastEdition.time).format('DD/MM') }</td>
                    <td>{record.visible ? 'Yes' : 'No'}</td>


                    <td>
                        <Link
                            className="btn btn-default btn-sm btn-table"
                            to={`posts/${record._id}/edit`}>

                            <i className="fa fa-pencil" aria-hidden="true"></i>
                        </Link>

                        <Link
                            className="btn btn-default btn-sm btn-table"
                            to={`posts/${record._id}`}>

                            <i className="fa fa-eye" aria-hidden="true"></i>
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

                            <th>Title</th>
                            <th>Created</th>
                            <th>Edited</th>

                            <th>Visible</th>
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
