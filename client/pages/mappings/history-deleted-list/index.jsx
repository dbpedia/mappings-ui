'use strict';
const Actions = require('./actions');
const FilterForm = require('./filter-form.jsx');
const Paging = require('../../../components/paging.jsx');
const UserUtilities = require('../../../helpers/user-utilities');
const ReactRouter = require('react-router-dom');
const Link = ReactRouter.Link;
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



        Actions.changeSearchQuery(this.els.filters.state, this.props.history);
    }

    onPageChange(page) {

        this.els.filters.changePage(page);
    }

    restore(template,lang,version) {

        window.confirm('Are you sure?') &&
        Actions.restore(template,lang,version,this.props.history);
    }

    delete(template,lang) {

        window.confirm('Are you sure? This action CANNOT be undone') &&
        Actions.delete(template,lang,this.props.history);
    }

    getUserLanguage(){

        if (this.state.isAuthenticated){
            if (!this.state.language){
                return '';
            }
            return this.state.language;
        }

        return 'en';

    }

    render() {



        return (
            <section className="container">
                <div className="page-header">
                    <div className="row">
                        <div className="col-sm-8">
                            <h1 style={ { margin:0 } }><Link to={'/mappings?lang=' + this.getUserLanguage()}>Mapping List</Link> / Deleted</h1>
                        </div>
                    </div>


                </div>
                <div className="row">
                    <div className="col-sm-8"> {/*Left column: results */}
                        <Results data={this.state.results.data}
                                 onRestore={this.restore.bind(this)}
                                 canRestore={UserUtilities.hasPermission(this.props.user,'can-restore-mappings')}
                                 onDelete={this.delete.bind(this)}
                                 canDelete={UserUtilities.hasPermission(this.props.user,'can-remove-mappings-history')}
                        />
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
