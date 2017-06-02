'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');


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
                activeTab="accounts">

                <div id="app-mount"></div>
            </Layout>
        );
    }
}


module.exports = AccountsPage;
