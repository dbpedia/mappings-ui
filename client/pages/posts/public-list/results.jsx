'use strict';
const PropTypes = require('prop-types');
const React = require('react');
const Moment = require('moment');

const propTypes = {
    data: PropTypes.array
};


class Results extends React.Component {
    render() {

        const rows = this.props.data.map((record) => {

            return (
                <tr key={record._id}>

                    <td><a href={'/posts/view/' + record.postId}>{record.title}</a></td>
                    <td>{record.lastEdition.username}, on {Moment(record.lastEdition.time).format('DD/MM hh:mm:ss') }</td>

                </tr>
            );
        });

        return (
            <div className="table-responsive">
                <table className="table table-striped table-results">
                    <thead>
                        <tr>

                            <th>Title</th>

                            <th>Edited</th>


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
