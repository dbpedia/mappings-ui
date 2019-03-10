'use strict';
const Actions = require('./actions');
const ShowDetailedError = require('./detailed-error-modal.jsx');
const FilterForm = require('./filter-form.jsx');
const Paging = require('../../../components/paging.jsx');
const ButtonGroup = require('../../../components/button-group.jsx');
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
        Actions.getMappingsResults(query);
        Actions.getOntologyResults(query);
        this.els = {};
        this.state = Store.getState();
    }

    componentWillReceiveProps(nextProps) {
        Actions.getMappingsResults();
        Actions.getOntologyResults();
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

    onMappingsFiltersChange(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.setState({ mappingsQuery:this.els.mappingsFilters.state }, () => {
            Actions.changeMappingsSearchQuery(this.state.mappingsQuery.page,this.state.mappingsQuery.limit,
            this.props.history);
        });
    }

    onOntologyFiltersChange(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.setState({ ontologyQuery:this.els.ontologyFilters.state }, () => {
            Actions.changeOntologySearchQuery(this.state.ontologyQuery.page,this.state.ontologyQuery.limit,
            this.props.history);
        });

    }

    onMappingsPageChange(page) {
        this.els.mappingsFilters.changePage(page);
    }

    onOntologyPageChange(page) {
        this.els.ontologyFilters.changePage(page);
    }

    onDetailedErrorClick(record) {
        Actions.showDetailedError(record);
    }

    onClearClick(){
        window.confirm('Are you sure? This cannot be undone') &&
        Actions.clearHistory(this.props.history);
    }

    render() {
        const buttons = [
            { type: 'btn-danger',
                text: <span><i className="fa fa-trash" aria-hidden="true"></i>&nbsp;Clear updates history</span>,
                action:this.onClearClick.bind(this)
            }
        ];

        return (
            <section className="container">
                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}  />
                    <h1>Github Updates</h1>
                </div>
                <div className="row">
                    <div className="col-sm-6"> {/*Left column: results */}
                        <h3>Mappings Updates</h3>
                        <Results data={this.state.mappingsResults.data} showDetailedError={this.onDetailedErrorClick.bind(this)} />
                        <Paging
                            ref={(c) => (this.els.paging = c)}
                            pages={this.state.mappingsResults.pages}
                            items={this.state.mappingsResults.items}
                            loading={this.state.mappingsResults.loading}
                            onChange={this.onMappingsPageChange.bind(this)}
                        />
                    </div>
                    <div className="col-sm-6"> {/*Left column: results */}
                        <h3>Ontology Updates</h3>
                        <Results data={this.state.ontologyResults.data} showDetailedError={this.onDetailedErrorClick.bind(this)} />
                        <Paging
                            ref={(c) => (this.els.paging = c)}
                            pages={this.state.ontologyResults.pages}
                            items={this.state.ontologyResults.items}
                            loading={this.state.ontologyResults.loading}
                            onChange={this.onOntologyPageChange.bind(this)}
                        />
                    </div>
                    <ShowDetailedError
                        history={this.props.history}
                        location={this.props.location}
                        {...this.state.detailedError}
                    />
                    <div className="col-sm-4" hidden> Right column: filters
                        <FilterForm
                            ref={(c) => (this.els.mappingsFilters = c)}
                            loading={this.state.mappingsResults.loading}
                            query={this.state.mappingsQuery}
                            onChange={this.onMappingsFiltersChange.bind(this)}

                        />
                    </div>
                    <div className="col-sm-4" hidden> Right column: filters
                        <FilterForm
                            ref={(c) => (this.els.ontologyFilters = c)}
                            loading={this.state.ontologyResults.loading}
                            query={this.state.ontologyQuery}
                            onChange={this.onOntologyFiltersChange.bind(this)}
                        />
                    </div>
                </div>

            </section>
        );
    }
}
SearchPage.propTypes = propTypes;
module.exports = SearchPage;
