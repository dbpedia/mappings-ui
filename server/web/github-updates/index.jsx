'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');
const PropTypes = require('prop-types');


const propTypes = {

    credentials: PropTypes.object

};

class GithubUpdates extends React.Component {
    render() {

        const neck = [
            <link key="layout" rel="stylesheet" href="/public/layouts/default.min.css" />,
            <link key="page" rel="stylesheet" href="/public/pages/githubupdates.min.css" />
        ];
        const feet = <script src="/public/pages/githubupdates.min.js"></script>;

        return (
            <Layout
                title="Github Updates"
                neck={neck}
                feet={feet}
                activeTab="githubupdates"
                credentials={this.props.credentials}>

                {/* From now on, client will be responsible for rendering */}
                <div id="app-mount"></div>
            </Layout>
        );
    }
}


GithubUpdates.propTypes = propTypes;

module.exports = GithubUpdates;
