/* eslint-disable hapi/hapi-scope-start */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const Treebeard = require('react-treebeard').Treebeard;

const theme =  {
    tree: {
        base: {
            listStyle: 'none',
                backgroundColor: '#FFFFFF',
                margin: 0,
                padding: 0,
                color: '#000000',
                fontFamily: 'lucida grande ,tahoma,verdana,arial,sans-serif',
                fontSize: '14px'
        },
        node: {
            base: {
                position: 'relative'
            },
            link: {
                cursor: 'pointer',
                    position: 'relative',
                    padding: '0px 5px',
                    display: 'block'
            },
            activeLink: {
                background: '#E4EAF0'
            },
            toggle: {
                base: {
                    position: 'relative',
                        display: 'inline-block',
                        verticalAlign: 'top',
                        marginLeft: '-5px',
                        height: '24px',
                        width: '24px'
                },
                wrapper: {
                    position: 'absolute',
                        top: '50%',
                        left: '50%',
                        margin: '-7px 0 0 -7px',
                        height: '14px'
                },
                height: 14,
                    width: 14,
                    arrow: {
                    fill: '#000000',
                        strokeWidth: 0
                }
            },
            header: {
                base: {
                    display: 'inline-block',
                        verticalAlign: 'top',
                        color: '#000000'
                },
                connector: {
                    width: '2px',
                        height: '12px',
                        borderLeft: 'solid 2px black',
                        borderBottom: 'solid 2px black',
                        position: 'absolute',
                        top: '0px',
                        left: '-21px'
                },
                title: {
                    lineHeight: '24px',
                        verticalAlign: 'middle'
                }
            },
            subtree: {
                listStyle: 'none',
                    paddingLeft: '19px'
            },
            loading: {
                color: '#000000'
            }
        }
    }
};

class TemplateList extends React.Component {

    constructor(props){
        super(props);
        this.state = {data: {}};
        this.onToggle = this.onToggle.bind(this);
    }




    generateDataFromTemplate(template,unfolded,customName){

        const root = {
            name: <b>{template.name}</b>,
            toggled: unfolded,
            children: []
        };

        if(customName){
            root.name = customName
        }



        for (var k in template.parameters) {
            if (template.parameters.hasOwnProperty(k)) {

                const prop = template.parameters[k];
                if(typeof prop === 'string' && prop.length > 0){
                    root.children.push(
                        {
                            name: <span><u>{k}</u>: {template.parameters[k]}</span>,
                            toggled: false
                        }
                    );
                }
                //Templates
                if(k === 'templates' && prop instanceof Array && prop.length > 0 ) {
                    const temp ={
                            name: <span><u>templates</u> ({prop.length})</span>,
                            toggled: false,
                            children: []
                        };

                    for(let i = 0; i < prop.length; i++){ //Add unfoldable
                        const template = prop[i];
                        temp.children.push(
                            this.generateDataFromTemplate(template,false)
                        );
                    }
                    root.children.push(temp);
                }
                //Fallback is as one more property
                if(k === 'fallback' && typeof prop === 'object'){
                    root.children.push(this.generateDataFromTemplate(
                        prop,
                        false,
                        <span><b>{prop.name}</b> (Fallback)</span>)
                    )
                }

            }
        }


        return root;

    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.template !== this.props.template) {
            //Here, we should process and store processed data into state.data

            const data = this.generateDataFromTemplate(nextProps.template,true);

            this.setState({template:nextProps.template,data});
        }


    }

    onToggle(node, toggled){
        if(this.state.cursor){this.state.cursor.active = false;}
        node.active = true;
        if(node.children){ node.toggled = toggled; }
        this.setState({ cursor: node });
    }
    render(){
        return (
            <div>
                {!this.props.loading &&
                <Treebeard
                    data={this.state.data}
                    onToggle={this.onToggle}
                    style={theme}
                    animations={false}
                />}

                {this.props.loading &&
                <span><i className="fa fa-refresh fa-spin"></i> Loading...</span>}
                {(!this.state.data || Object.keys(this.state.data).length === 0) && !this.props.loading &&
                <span><i>No templates</i></span>}
            </div>

        );
    }
}

//TemplateList.propTypes = propTypes;
module.exports = TemplateList;
