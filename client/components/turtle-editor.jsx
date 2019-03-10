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
    onLoad: PropTypes.func,
    isScriptLoaded: PropTypes.bool,
    isScriptLoadSucceed: PropTypes.bool,
    readOnly:  PropTypes.bool,
    id: PropTypes.string,
    canExternallyChange: PropTypes.bool,
    showGutter: PropTypes.bool
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

        if (nextProps.content && nextProps.content !== this.props.content){
            this.setText(nextProps.content);
        }
    }

    setText(text) {
        if (this.state.initialized && this.state.editor) {
            this.state.editor.session.doc.setValue(text,0);
        }
    }

    initEditor(){
        const editor = ace.edit(this.props.id);
        const TurtleMode = ace.require('ace/mode/turtle').Mode;
        editor.session.setMode(new TurtleMode());
        const options = {
            fontSize: 15,
            maxLines: 40,
            minLines: 20,
            showGutter: this.props.showGutter,
            wrap:true,
            theme: 'ace/theme/github',
            enableBasicAutocompletion: true,
            readOnly: this.props.readOnly,
            highlightActiveLine: !this.props.readOnly
        };

        editor.getSession().on('change', () => {
            this.props.onChange(editor.getSession().getValue());
        });

        editor.setOptions(options);

        if (options.readOnly) {
            editor.renderer.$cursorLayer.element.style.display = 'none';
        }

        this.setState({ editor,initialized:true });

        if (this.props.onLoad){
            this.props.onLoad(editor);
        }
    }

    render() {
        return (
            <div>
                { !this.props.canExternallyChange &&
                    <div className="editor" id={this.props.id} style={{ visibility: this.state.initialized ? 'visible' : 'hidden' }}>{this.props.content}</div>
                }
                { this.props.canExternallyChange &&
                    <div className="editor" id={this.props.id} style={{ visibility: this.state.initialized ? 'visible' : 'hidden' }}>{}</div>
                }
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
