'use strict';
const PropTypes = require('prop-types');
const React = require('react');
const ReactRouter = require('react-router-dom');
const Link = ReactRouter.Link;

const propTypes = {
    data: PropTypes.array,
    canEdit: PropTypes.bool
};

const calculatePercentage = function (record){

    if (!record.stats || Object.keys(record.stats).length === 0 ) {
        return '-';
    }

    return (record.stats.numMappedProperties * 100 / record.stats.numProperties).toFixed(2);
};

/**
 * >= 80 % = Green
 * >= 40 % = Blue
 * < 40 % = Yellow
 * 0 % = Red (can't be seen)
 * Ignored: gray
 */
const progressBarClass = function (record){

    const percentage = calculatePercentage(record);

    if (record.status.error){
        return 'progress-bar-danger';
    }
    if (record.ignore){
        return 'progress-bar-disabled';
    }
    if (percentage === 0){
        return 'progress-bar-error';
    }
    if (percentage >= 80){
        return 'progress-bar-success';
    }
    if (percentage >= 40){
        return 'progress-bar-info';
    }

    if (percentage < 40) {
        return 'progress-bar-warning';
    }

};

const rowBackground = function (record){

    if (record.ignore) {
        return 'row-disabled';
    }

    if (record.status.error) {
        return 'danger';
    }

    /*const percentage = calculatePercentage(record);

    if (percentage === 0){
        return 'error';
    }
    if (percentage >= 80){
        return 'success';
    }
    if (percentage >= 40){
        return 'info';
    }

    if (percentage < 40) {
        return 'warning';
    }
*/

    return '';
};


const statsExist = function (record){

    return record.stats && Object.keys(record.stats).length > 0;
};
class Results extends React.Component {
    render() {

        const rows = this.props.data.map((record) => {

            return (
                <tr key={record._id.template} className={ rowBackground(record) }>
                    <td>{record._id.lang}</td>
                    <td><a href={`mappings/view/${record._id.template}/${record._id.lang}`}>{record.templateFullName}</a></td>
                    <td className="hidden-xs hidden-sm">{statsExist(record) ? record.stats.numOcurrences : '-'}</td>
                    <td className="hidden-xs hidden-sm">{statsExist(record) ? record.stats.numProperties : '-'}</td>

                    <td>
                        <div className="progress">
                            <div className={'progress-bar ' + progressBarClass(record)} style={{ width:  calculatePercentage(record) + '%' }}>
                                <span>{calculatePercentage(record)} %</span>
                            </div>
                        </div>
                    </td>

                    <td>{record.status.message}</td>
                    <td>
                        {this.props.canEdit && <Link
                            className="btn btn-default btn-sm btn-table"
                            to={`mappings/edit/${record._id.template}/${record._id.lang}`}>
                            <i className="fa fa-pencil" aria-hidden="true"></i>
                        </Link>}

                        <Link
                            className="btn btn-default btn-sm btn-table"
                            to={`mappings/view/${record._id.template}/${record._id.lang}`}>
                            <i className="fa fa-eye" aria-hidden="true"></i>
                        </Link>
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

                            <th className="hidden-xs hidden-sm">Ocurrences</th>

                            <th className="hidden-xs hidden-sm">Properties</th>

                            <th>Completed</th>

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
