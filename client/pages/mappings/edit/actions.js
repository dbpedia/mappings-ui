/* global window */
'use strict';
const ApiActions = require('../../../actions/api');
const Constants = require('./constants');
const Store = require('./store');


class Actions {

    static getDetails(template,lang) {

        ApiActions.get(
            `/api/mappings/${template}/${lang}`,
            undefined,
            Store,
            Constants.GET_DETAILS,
            Constants.GET_DETAILS_RESPONSE
        );
    }

    static saveDetails(template,lang, data,history) {

        ApiActions.put(
            `/api/mappings/${template}/${lang}`,
            data,
            Store,
            Constants.SAVE_DETAILS,
            Constants.SAVE_DETAILS_RESPONSE
        );
    }

    static hideDetailsSaveSuccess() {

        Store.dispatch({
            type: Constants.HIDE_DETAILS_SAVE_SUCCESS
        });
    }


    static hideError() {

        Store.dispatch({
            type: Constants.HIDE_ERROR
        });
    }

    static delete(template,lang, history) {

        ApiActions.delete(
            `/api/mappings/${template}/${lang}`,
            undefined,
            Store,
            Constants.DELETE,
            Constants.DELETE_RESPONSE,
            (err, response) => {

                if (!err) {
                    history.push('/mappings');

                    window.scrollTo(0, 0);
                }
            }
        );
    }

    static getRMLfromTemplate(template,lang,dump,type,content,editorBox,templatePanel) {

        const data = {
            mappingName: template,
            mappingLang: lang,
            mappingDump: dump,
            templateType: type,
            templateContent: content
        };

        ApiActions.post(
            '/api/mappings/rml',
            data,
            Store,
            Constants.GET_RML_TEMPLATE,
            Constants.GET_RML_TEMPLATE_RESPONSE,
            (err, response) => {


                if (!err) {

                    //Write result to box, it was OK
                    editorBox.setText(response.mapping.dump);
                    templatePanel.closeModal();
                    templatePanel.setAutoremoveAlert();
                    this.getTemplatesFromRML(template,lang,response.mapping.dump);
                }

            }
        );
    }

    //Used to update the template object used to show the template overview
    static getTemplatesFromRML(template,lang,dump){

        const data = {
            mappingName: template,
            mappingLang: lang,
            mappingDump: dump
        };

        ApiActions.post(
            '/api/mappings/templates',
            data,
            Store,
            Constants.GET_TEMPLATE_LIST,
            Constants.GET_TEMPLATE_LIST_RESPONSE
        );

    }

    //Used to update the template object used to show the template overview
    static extractTriples(template,lang,dump,wikititle){

        const data = {
            mappingName: template,
            mappingLang: lang,
            mappingDump: dump,
            wikititle
        };

        ApiActions.post(
            '/api/mappings/extract',
            data,
            Store,
            Constants.GET_EXTRACTION_TRIPLES,
            Constants.GET_EXTRACTION_TRIPLES_RESPONSE
        );

    }
}


module.exports = Actions;
