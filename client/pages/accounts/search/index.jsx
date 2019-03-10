'use strict';
const Actions = require('./actions');
const CreateNewForm = require('./create-new-form.jsx');
const FilterForm = require('./filter-form.jsx');
const ButtonGroup = require('../../../components/button-group.jsx');
const Paging = require('../../../components/paging.jsx');
const PropTypes = require('prop-types');
const React = require('react');
const Results = require('./results.jsx');
const Store = require('./store');
const Qs = require('qs');

const propTypes = {
    history: PropTypes.object,
    location: PropTypes.object
};

class SearchPage extends React.Component {
    constructor(props) {
        super(props);
        const query = Qs.parse(this.props.location.search.substring(1));

        //Get results from backend
        Actions.getResults(query);

        //Get the list of groups
        Actions.getGroupOptions();

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

        Actions.changeSearchQuery(this.els.filters.state, this.props.history);
    }

    onPageChange(page) {
        this.els.filters.changePage(page);
    }

    onNewClick() {
        Actions.showCreateNew();
    }

    render() {
        const buttons = [
            { type: 'btn-success', text: <span><i className="fa fa-plus" aria-hidden="true"></i>&nbsp;New Account</span>,
                action:this.onNewClick.bind(this), ref:(c) => (this.els.createNew = c)
            }
        ];

        return (
            <section className="container">
                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}  />

                    <h1>Accounts</h1>
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
                    <CreateNewForm
                        history={this.props.history}
                        location={this.props.location}
                        {...this.state.createNew}
                    />
                    <div className="col-sm-4"> {/*Right column: filters */}
                        <FilterForm
                            ref={(c) => (this.els.filters = c)}
                            loading={this.state.results.loading}
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
