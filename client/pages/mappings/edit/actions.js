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

        //TODO: Maybe some pre-processing is needed

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
                }

            }
        );
    }
}


module.exports = Actions;
