'use strict';
const FilterFormHoc = require('../components/filter-form-hoc.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const SelectControl = require('../../../components/form/select-control.jsx');
const TextControl = require('../../../components/form/text-control.jsx');
const MappingLangSelector = require('../../../components/mapping-lang-selector.jsx');

const propTypes = {
    linkInputState: PropTypes.func,
    linkSelectState: PropTypes.func,
    onSubmitFilters: PropTypes.func,
    loading: PropTypes.bool,
    state: PropTypes.object
};
const defaultValues = {
    template: '',
    lang: '',
    errored: '',
    minCompletion: 0,
    maxCompletion: 100,
    sort: '-_id.template',
    limit: '20',
    page: '1'
};


class FilterForm extends React.Component {


    render() {



        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <h3 className="panel-title text-center"><b>Filters</b></h3>
                </div>
                <div className="panel-body">
                    <div>
                        <div className="row">
                            <div className="col-sm-6">
                                <SelectControl
                                    name="sort"
                                    label="Sort"
                                    value={this.props.state.sort}
                                    onChange={this.props.linkSelectState}
                                    disabled={this.props.loading}>

                                    <option value="_id.template">name &#9650;</option>
                                    <option value="-_id.template">name &#9660;</option>
                                    <option value="_id.lang">language &#9650;</option>
                                    <option value="-_id.lang">language &#9660;</option>
                                    <option value="status.message">status &#9650;</option>
                                    <option value="-status.message">status &#9660;</option>


                                </SelectControl>
                            </div>

                            <div className="col-sm-6">
                                <SelectControl
                                    name="limit"
                                    label="Limit"
                                    value={this.props.state.limit}
                                    onChange={this.props.linkSelectState}
                                    disabled={this.props.loading}>
                                    <option value="5">5 items</option>
                                    <option value="10">10 items</option>
                                    <option value="20">20 items</option>
                                    <option value="50">50 items</option>
                                    <option value="100">100 items</option>
                                </SelectControl>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-sm-12">
                                <MappingLangSelector
                                    name="lang"
                                    selectedLang={this.props.state.lang}
                                    onChange={this.props.linkSelectState}
                                    disabled={this.props.loading}
                                />

                            </div>
                            <div className="col-sm-12">
                                <TextControl
                                    name="template"
                                    label="Name"
                                    value={this.props.state.template}
                                    onChange={this.props.linkInputState}
                                    disabled={this.props.loading}
                                />
                            </div>
                            <div className="col-sm-12">
                                <SelectControl
                                    name="errored"
                                    label="Status"
                                    value={this.props.state.errored}
                                    onChange={this.props.linkSelectState}
                                    disabled={this.props.loading}>
                                    <option value="">Any</option>
                                    <option value="false">OK</option>
                                    <option value="true">Errored</option>

                                </SelectControl>
                            </div>
                        </div>






                        <div className="row">
                            <div className="col-sm-12">
                                <button type="button" className="btn btn-primary btn-block" onClick={this.props.onSubmitFilters} disabled={this.props.loading}>Apply Filters</button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

FilterForm.propTypes = propTypes;


module.exports = FilterFormHoc(FilterForm, defaultValues);
