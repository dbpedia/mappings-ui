'use strict';
const Actions = require('./actions');
const FilterForm = require('./filter-form.jsx');
const Paging = require('../../../components/paging.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const Results = require('./results.jsx');
const Store = require('./store');
const Qs = require('qs');


const propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    user: PropTypes.object
};


class SearchPage extends React.Component {
    constructor(props) {

        super(props);

        const query = Qs.parse(this.props.location.search.substring(1));

        //Get results from backend
        Actions.getResults(query);

        this.els = {};
        this.state = Store.getState();
    }

    componentWillReceiveProps(nextProps) {

        const query = Qs.parse(nextProps.location.search.substring(1));

        Actions.getResults(query);
    }

    componentDidMount() {

        this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));
    }

    componentWillUnmount() {

        this.unsubscribeStore();
    }

    onStoreChange() {

        this.setState(Store.getState());
    }

    onFiltersChange(event) {

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        //To control number input
        if (!this.els.filters.state.minCompletion || this.els.filters.state.minCompletion < 0 ) {
            this.els.filters.state.minCompletion = 0;
        }
        if (!this.els.filters.state.maxCompletion || this.els.filters.state.maxCompletion > 100) {
            this.els.filters.state.maxCompletion = 100;
        }


        Actions.changeSearchQuery(this.els.filters.state, this.props.history);
    }

    onPageChange(page) {

        this.els.filters.changePage(page);
    }

    onNewClick() {

        Actions.showCreateNew();
    }

    render() {



        return (
            <section className="container">
                <div className="page-header">

                    <div className="row">
                        <div className="col-sm-8">
                            <h1 style={ { margin:0 } }>Mapping List</h1>
                        </div>
                        <div className="col-sm-4">
                            <div className="input-group"> <input type="text" className="form-control pull-right"
                                                                 placeholder="Template name/Wikipedia page URL"/>

                                <span className="input-group-btn">
                                    <button className="btn btn-secondary btn-success" type="button">
                                        <span><i className="fa fa-plus" aria-hidden="true"></i></span>
                                    </button>
                                </span>

                            </div>
                        </div>
                    </div>


                </div>
                <div className="row">
                    <div className="col-sm-8"> {/*Left column: results */}
                        <Results data={this.state.results.data} />
                        <Paging
                            ref={(c) => (this.els.paging = c)}
                            pages={this.state.results.pages}
                            items={this.state.results.items}
                            loading={this.state.results.loading}
                            onChange={this.onPageChange.bind(this)}
                        />
                    </div>

                    <div className="col-sm-4"> {/*Right column: filters */}
                        <FilterForm
                            ref={(c) => (this.els.filters = c)}
                            loading={false}
                            query={Qs.parse(this.props.location.search.substring(1))}
                            onChange={this.onFiltersChange.bind(this)}
                            groups={this.state.groups}

                        />
                    </div>
                </div>

            </section>
        );
    }
}

SearchPage.propTypes = propTypes;


module.exports = SearchPage;
