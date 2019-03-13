'use strict';
const Actions = require('./actions');
const Paging = require('../../../components/paging.jsx');
const UserUtilities = require('../../../helpers/user-utilities');
const ReactRouter = require('react-router-dom');
const PropTypes = require('prop-types');
const React = require('react');
const Results = require('./results.jsx');
const Store = require('./store');
const Link = ReactRouter.Link;

const propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    user: PropTypes.object,
    match: PropTypes.object
};

class SearchPage extends React.Component {
    constructor(props) {
        super(props);
        //Get results from backend
        Actions.getResults(this.props.match.params.template,this.props.match.params.lang);
        this.els = {};
        this.state = Store.getState();
    }

    componentWillReceiveProps(nextProps) {
        Actions.getResults(this.props.match.params.template,this.props.match.params.lang);
    }

    componentDidMount() {
        this.unsubscribeStore = Store.subscribe(this.onStoreChange.bind(this));
        document.title = 'History of ' + this.props.match.params.template + '/' + this.props.match.params.lang
            + '/DBpedia Mappings UI';
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

    restore(template,lang,version) {
        window.confirm('Are you sure? Current version will be archived.') &&
        Actions.restore(template,lang,version,this.props.history);
    }

    goToHistory(){
        this.props.history.push('/mappings/history/' + this.state.details._id.template + '/' + this.state.details._id.lang);
    }

    render() {
        const template = this.props.match.params.template;
        const lang = this.props.match.params.lang;

        return (
            <section className="container">
                <div className="page-header">
                    <div className="row">
                        <div className="col-sm-8">
                            <h2 style={ { margin:0 } }>Old versions of <Link to={'/mappings/view/' +  template + '/' + lang}>{template + ' (' +  lang + ')'}</Link></h2>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12"> {/*Left column: results */}
                        { this.state.results.data.length > 0 &&
                        <div>
                            <Results data={this.state.results.data} onRestore={this.restore.bind(this)} canRestore={UserUtilities.hasPermission(this.props.user,'can-restore-mappings')} />

                            <Paging
                                ref={(c) => (this.els.paging = c)}
                                pages={this.state.results.pages}
                                items={this.state.results.items}
                                loading={this.state.results.loading}
                                onChange={this.onPageChange.bind(this)}
                            />
                        </div>
                        }
                        {
                            this.state.results.data.length === 0 &&
                                <span>No old revisions available</span>
                        }
                    </div>

                </div>

            </section>
        );
    }
}
SearchPage.propTypes = propTypes;
module.exports = SearchPage;
