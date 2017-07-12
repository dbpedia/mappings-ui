/* eslint-disable hapi/hapi-scope-start */
/* Component to show a ace turtle editor. Has to use different instance
as react-ace, as react-ace does not support turtle yet.
 */
'use strict';

const PropTypes = require('prop-types');
const React = require('react');
const ScriptLoader = require('react-async-script-loader').default;

const propTypes = {
    content: PropTypes.string,
    onChange: PropTypes.func,
    isScriptLoaded: PropTypes.bool,
    isScriptLoadSucceed: PropTypes.bool
};


class Editor extends React.Component {


    constructor(){
        super();
        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isScriptLoaded && !this.props.isScriptLoaded) { // load finished
            if (nextProps.isScriptLoadSucceed) {
                this.initEditor();
            }

        }


    }



    initEditor(){

        const editor = ace.edit('editor');
        const TurtleMode = ace.require('ace/mode/turtle').Mode;
        editor.session.setMode(new TurtleMode());
        const options = {
            fontSize: 15,
            maxLines: 40,
            wrap:true,
            theme: 'ace/theme/github',
            enableBasicAutocompletion: true
        };


        editor.getSession().on('change', () => {
            this.props.onChange(editor.getSession().getValue());
        });

        editor.setOptions(options);

        this.setState({ editor,initialized:true });
    }

    render() {



        return (

            <div>


                    <div id="editor" style={{ visibility: this.state.initialized ? 'visible' : 'hidden' }}>{this.props.content }</div>
                    <i style={{ visibility: !this.state.initialized ? 'visible' : 'hidden' }}>Loading editor...</i>


            </div>

        );
    }
}


Editor.propTypes = propTypes;
module.exports = ScriptLoader(
    [
        '/public/ace/ace.js'

    ],
    '/public/ace/mode-turtle.js',
    '/public/ace/ext-language_tools.js'
)(Editor);
