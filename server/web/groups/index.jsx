'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');


class AdminPage extends React.Component {
    render() {

        const neck = [
            <link key="layout" rel="stylesheet" href="/public/layouts/default.min.css" />,
            <link key="page" rel="stylesheet" href="/public/pages/groups.min.css" />
        ];
        const feet = <script src="/public/pages/groups.min.js"></script>;

        return (
            <Layout
                title="Groups"
                neck={neck}
                feet={feet}
                activeTab="groups"
                credentials={this.props.credentials}>

                <div id="app-mount"></div>
            </Layout>
        );
    }
}


module.exports = AdminPage;
