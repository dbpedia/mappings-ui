'use strict';
const DetailedError = require('./reducers/detailed-error');
const Redux = require('redux');
const MappingsResults = require('./reducers/mappings-results');
const OntologyResults = require('./reducers/ontology-results');

module.exports = Redux.createStore(
    Redux.combineReducers({
        detailedError: DetailedError,
        mappingsResults: MappingsResults,
        ontologyResults: OntologyResults
    })
);
