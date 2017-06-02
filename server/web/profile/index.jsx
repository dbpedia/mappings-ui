'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');


class ProfilePage extends React.Component {
    render() {

        const neck = [
            <link key="layout" rel="stylesheet" href="/public/layouts/default.min.css" />,
            <link key="page" rel="stylesheet" href="/public/pages/profile.min.css" />
        ];
        const feet = <script src="/public/pages/profile.min.js"></script>;

        return (
            <Layout
                title="Account"
                neck={neck}
                feet={feet}
                activeTab="profile">

                <div id="app-mount"></div>
            </Layout>
        );
    }
}


module.exports = ProfilePage;
