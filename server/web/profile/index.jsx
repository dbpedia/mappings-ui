'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');
const PropTypes = require('prop-types');

const propTypes = {
    credentials: PropTypes.object
};

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
                activeTab="profile"
                credentials={this.props.credentials}>

                <div id="app-mount"></div>
            </Layout>
        );
    }
}
ProfilePage.propTypes = propTypes;
module.exports = ProfilePage;
