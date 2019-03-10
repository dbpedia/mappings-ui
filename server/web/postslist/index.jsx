'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');
const PropTypes = require('prop-types');

const propTypes = {
    credentials: PropTypes.object
};

class PostsList extends React.Component {
    render() {
        const neck = [
            <link key="layout" rel="stylesheet" href="/public/layouts/default.min.css" />,
            <link key="page" rel="stylesheet" href="/public/pages/posts.min.css" />
        ];
        const feet = <script src="/public/pages/posts.min.js"></script>;

        return (
            <Layout
                title="Posts List"
                neck={neck}
                feet={feet}
                activeTab="posts"
                credentials={this.props.credentials}>

                {/* From now on, client will be responsible for rendering */}
                <div id="app-mount"></div>
            </Layout>
        );
    }
}
PostsList.propTypes = propTypes;
module.exports = PostsList;
