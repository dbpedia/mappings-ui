/* eslint-disable hapi/hapi-scope-start */
'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const Modal = require('../../../components/modal.jsx');

const propTypes = {
    onTemplateFinish: PropTypes.func,
    loading: PropTypes.bool
};
class AddTemplatePanel extends React.Component {


    constructor(){

        super();
        this.state = {
            showModal: false,
            templateType: 'SimplePropertyTemplate',
            errorAlert: false,
            successAlert: false,
            loading: false
        };


    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.errorAlert !== this.props.errorAlert) {
            this.setState({ errorAlert: nextProps.errorAlert });
        }
        if (nextProps.successAlert !== this.props.successAlert) {
            this.setState({ successAlert: nextProps.successAlert });
        }
        if (nextProps.messageAlert !== this.props.messageAlert) {
            this.setState({ messageAlert: nextProps.messageAlert });
        }
        if (nextProps.loading !== this.props.loading) {
            this.setState({ loading: nextProps.loading });
        }

    }

    setAutoremoveAlert(){




        const self = this;
        setTimeout(() => {
            self.setState({ errorAlert:false, successAlert: false });
        },5000);

    }
    selectHandler(event){

        this.setState({ templateType:event.target.value });
    }

    showTemplateModal(){

        this.setState({ showModal:true });
    }

    //Closes the modal externally, called by root component when state has been saved without any error
    closeModal(){
        this.setState({showModal:false});
        this.refs.child.eraseState();
    }

    onTemplateFinish(save,childType,content){

        //Here, I have to hide the error
        this.setState({errorAlert:false,successAlert:false});

        //Have to call root callback, tell root that we have to go to server. Only if saved.
        if (save){
            //If save, then root component is responsible for calling closeModal
            this.props.onTemplateFinish(childType,content);
        }
        else {
            this.refs.child.eraseState();
            this.setState({showModal: false});
        }




    }



    render() {


        return (

            <div className="panel panel-default">
                <div className="templateModalWrapper">
                    <Modal
                        show={this.state.showModal}>
                        <div className="container">
                            {/*Alert should be showed here, so user can correct the errors*/}

                            {   this.state.loading &&
                            <div className="alert alert-info"><i className="fa fa-refresh fa-spin"></i> Loading...</div>
                            }
                            {   this.state.errorAlert &&
                                <div className="alert alert-danger">{this.state.messageAlert}</div>
                            }

                            {
                                React.createFactory(require('./rows/' + this.state.templateType))(
                                    {
                                        onClose: this.onTemplateFinish.bind(this),
                                        ref: 'child',
                                        childLevel: 0 })
                            };

                        </div>

                    </Modal>
                </div>
                <div className="panel-heading">
                    <h3 className="panel-title text-center"><b>Add template</b></h3>
                </div>
                <div className="panel-body">
                    {   this.state.successAlert &&
                        <div className="alert alert-success">{this.state.messageAlert}</div>

                    }
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="input-group">
                                <select className="form-control" value={this.state.templateType} onChange={this.selectHandler.bind(this)} disabled={this.props.loading}>
                                    <option>SimplePropertyTemplate</option>
                                    <option>IntermediateTemplate</option>
                                    <option>ConditionalTemplate</option>
                                    <option>StartDateTemplate</option>
                                    <option>EndDateTemplate</option>
                                    <option>GeocoordinateTemplate</option>
                                    <option>ConstantTemplate</option>
                                </select>
                                <span className="input-group-btn">
                                    <button
                                        className="btn btn-primary"
                                        type="button"
                                        disabled={this.props.loading}
                                        onClick={this.showTemplateModal.bind(this)}>
                                            {this.props.loading && <i className="fa fa-refresh fa-spin"></i>}
                                            {!this.props.loading && <span className="fa fa-plus" aria-hidden="true"></span>}
                                    </button>
                                </span>
                            </div>
                            <br/>
                            <i><i className="fa fa-question-circle-o" aria-hidden="true"></i>
                                &nbsp; Use this to generate RML code from a template and add it to the code. </i>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

AddTemplatePanel.propTypes = propTypes;
module.exports = AddTemplatePanel;
