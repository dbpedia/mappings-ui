'use strict';
const PropTypes = require('prop-types');
const React = require('react');
const TemplateInserter = require('./template-inserter');
const Store = require('./store');
const propTypes = {
    history: PropTypes.object,
    match: PropTypes.object,
    user: PropTypes.object
};


class InsertTemplatePage extends React.Component {
    constructor(props) {

        super(props);


        this.state = Store.getState();


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



    render() {

        return <TemplateInserter/>;
    }

}

InsertTemplatePage.propTypes = propTypes;


module.exports = InsertTemplatePage;
