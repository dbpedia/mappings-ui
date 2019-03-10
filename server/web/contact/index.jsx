'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');
const PropTypes = require('prop-types');

const propTypes = {
    credentials: PropTypes.object
};

class ContactPage extends React.Component {
    render() {
        const feet = <script src="/public/pages/contact.min.js"></script>;
        return (
            <Layout
                title="Contact us"
                feet={feet}
                activeTab="contact"
                credentials={this.props.credentials}>

                <div className="row">
                    <div className="col-sm-6" id="app-mount"></div>
                    <div className="col-sm-6 text-center">
                        <h1 className="page-header">Contact us</h1>
                        <p className="lead">
                            Freddy can't wait to hear from you.
                        </p>
                        <i className="fa fa-reply-all bamf"></i>
                        <div>
                            1428 Elm Street &bull; San Francisco, CA 94122
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
}
ContactPage.propTypes = propTypes;
module.exports = ContactPage;
