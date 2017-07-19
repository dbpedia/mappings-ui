'use strict';
const FilterFormHoc = require('../components/filter-form-hoc.jsx');
const PropTypes = require('prop-types');
const React = require('react');


const propTypes = {
    linkInputState: PropTypes.func,
    linkSelectState: PropTypes.func,
    onSubmitFilters: PropTypes.func,
    loading: PropTypes.bool,
    state: PropTypes.object,
    prefix: PropTypes.string
};
const defaultValues = {
    limit: '10',
    page: '1'
};


class MappingsFilterForm extends React.Component {


    render() {

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title text-center"><b>Filters</b></h3>
                </div>
                <div className="panel-body">

                </div>
            </div>
        );
    }
}

MappingsFilterForm.propTypes = propTypes;


module.exports = FilterFormHoc(MappingsFilterForm, defaultValues);
