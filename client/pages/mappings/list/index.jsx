'use strict';
const Actions = require('./actions');
const FilterForm = require('./filter-form.jsx');
const ButtonGroup = require('../../../components/button-group.jsx');
const Paging = require('../../../components/paging.jsx');
const UserUtilities = require('../../../helpers/user-utilities');
const CreateNewForm = require('./create-new-form.jsx');

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

    onNewClick() {

        Actions.showCreateNew();
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

    goToDeleted(){

        this.props.history.push('/mappings/history/deleted');
    }

    render() {


        const buttons = [
            { type: 'btn-success',
                text: <span><i className="fa fa-plus" aria-hidden="true"></i>&nbsp;New Mapping</span>,
                action:this.onNewClick.bind(this), ref:(c) => (this.els.createNew = c),
                disabled: !UserUtilities.hasPermission(this.props.user,'can-create-mappings')
            }
        ];


        const buttonsDeleted = [
            { type: 'btn-default',
                text: <span><i className="fa fa-trash" aria-hidden="true"></i>&nbsp;View deleted mappings</span>,
                action:this.goToDeleted.bind(this),
                disabled: !UserUtilities.hasPermission(this.props.user,'can-create-mappings')
            }
        ];



        return (
            <section className="container">

                <div className="page-header">
                    <ButtonGroup float='right' buttons={buttons}  />
                    <span style={{ float: 'right' }}>&nbsp;</span>
                    <ButtonGroup float='right' buttons={buttonsDeleted}/>

                    <div className="row">
                        <div className="col-sm-8">
                            <h1 style={ { margin:0 } }>Mapping List</h1>
                        </div>
                    </div>


                </div>
                <div className="row">
                    <div className="col-sm-8"> {/*Left column: results */}
                        <Results data={this.state.results.data} canEdit={ UserUtilities.hasPermission(this.props.user,'can-edit-mappings')} />
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
