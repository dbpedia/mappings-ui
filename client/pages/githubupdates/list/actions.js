/* global window */
'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const Store = require('./store');

class Actions {
    static getMappingsResults(data) {
        ApiActions.get(
            '/api/github-updates/mappings',
            data,
            Store,
            Constants.GET_MAPPINGS_RESULTS,
            Constants.GET_MAPPINGS_RESULTS_RESPONSE
        );
    }

    static getOntologyResults(data) {
        ApiActions.get(
            '/api/github-updates/ontology',
            data,
            Store,
            Constants.GET_ONTOLOGY_RESULTS,
            Constants.GET_ONTOLOGY_RESULTS_RESPONSE
        );
    }

    static clearHistory(history){
        ApiActions.delete(
            '/api/github-updates',
            {},
            Store,
            Constants.DELETE_HISTORY,
            Constants.DELETE_HISTORY_RESPONSE,
            (err, response) => {

                if (!err) {
                    history.push('/github-updates');

                    window.scrollTo(0, 0);
                }
            }
        );
    }

    static changeMappingsSearchQuery(page,limit, history) {
        ApiActions.get(
            '/api/github-updates/mappings',
            { page,limit },
            Store,
            Constants.GET_MAPPINGS_RESULTS,
            Constants.GET_MAPPINGS_RESULTS_RESPONSE
        );
        window.scrollTo(0, 0);
    }

    static changeOntologySearchQuery(page,limit, history) {
        ApiActions.get(
            '/api/github-updates/ontology',
            { page,limit },
            Store,
            Constants.GET_ONTOLOGY_RESULTS,
            Constants.GET_ONTOLOGY_RESULTS_RESPONSE
        );
        window.scrollTo(0, 0);
    }

    static showDetailedError(record) {
        Store.dispatch({
            type: Constants.SHOW_DETAILED_ERROR,
            record
        });
    }

    static hideDetailedError() {
        Store.dispatch({
            type: Constants.HIDE_DETAILED_ERROR
        });
    }

    static createNew(data, history) {
        ApiActions.post(
            '/api/posts',
            data,
            Store,
            Constants.CREATE_NEW,
            Constants.CREATE_NEW_RESPONSE,
            (err, response) => {

                if (!err) {
                    this.hideCreateNew();

                    const path = `/posts/edit/${response.postId}`;

                    history.push(path);

                    window.scrollTo(0, 0);
                }
            }
        );
    }
}
module.exports = Actions;
