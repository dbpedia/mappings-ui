'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');
const PropTypes = require('prop-types');

const propTypes = {
    credentials: PropTypes.object
};
class HomePage extends React.Component {
    render() {
        const neck = [
            <link key="layout" rel="stylesheet" href="/public/layouts/default.min.css" />,
            <link key="page" rel="stylesheet" href="/public/pages/posts.min.css" />
        ];
        const feet = <script src="/public/pages/posts.min.js"></script>;
        return (
            <Layout
                title="DBpedia Mappings UI"
                neck={neck}
                feet={feet}
                activeTab="home"
                credentials={this.props.credentials}
               >
                <div id="app-mount"></div>
            </Layout>
        );
    }
}
HomePage.propTypes = propTypes;
module.exports = HomePage;
