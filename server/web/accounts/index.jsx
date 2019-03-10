'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');
const PropTypes = require('prop-types');

const propTypes = {
    credentials: PropTypes.object
};

class AccountsPage extends React.Component {
    render() {
        const neck = [
            <link key="layout" rel="stylesheet" href="/public/layouts/default.min.css" />,
            <link key="page" rel="stylesheet" href="/public/pages/accounts.min.css" />
        ];
        const feet = <script src="/public/pages/accounts.min.js"></script>;

        return (
            <Layout
                title="Accounts"
                neck={neck}
                feet={feet}
                activeTab="accounts"
                credentials={this.props.credentials}>

                <div id="app-mount"></div>
            </Layout>
        );
    }
}
AccountsPage.propTypes = propTypes;
module.exports = AccountsPage;
