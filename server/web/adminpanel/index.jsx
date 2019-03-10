'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');
const PropTypes = require('prop-types');

const propTypes = {
    credentials: PropTypes.object
};

class AdminPanelPage extends React.Component {
    render() {
        const neck = [
            <link key="layout" rel="stylesheet" href="/public/layouts/default.min.css" />,
            <link key="page" rel="stylesheet" href="/public/pages/adminpanel.min.css" />
        ];
        const feet = <script src="/public/pages/adminpanel.min.js"></script>;

        return (
            <Layout
                title="Admin Panel"
                neck={neck}
                feet={feet}
                activeTab="adminpanel"
                credentials={this.props.credentials}>

                <div id="app-mount"></div>
            </Layout>
        );
    }
}
AdminPanelPage.propTypes = propTypes;
module.exports = AdminPanelPage;
