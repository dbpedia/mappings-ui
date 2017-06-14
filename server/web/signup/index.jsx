'use strict';
const Layout = require('../layouts/default.jsx');
const React = require('react');
const PropTypes = require('prop-types');


const propTypes = {

    credentials: PropTypes.object

};

class SignupPage extends React.Component {
    render() {

        const feet = <script src="/public/pages/signup.min.js"></script>;

        const neck = [
            <link key="layout" rel="stylesheet" href="/public/layouts/default.min.css" />,
            <link key="page" rel="stylesheet" href="/public/pages/signup.min.css" />
        ];
        return (
            <Layout
                title="Sign up"
                neck={neck}
                feet={feet}
                activeTab="signup"
                credentials={this.props.credentials}
            >

                <div className="row">
                    <h1 className="page-header">Create a new account</h1>
                    <div className="col-sm-6" id="app-mount"></div>
                    <div className="col-sm-6 text-center">
                        <img className="big-logo" src="/public/media/dbpedia_plain.png"/>
                        <p className="lead">
                            Welcome to DBpedia Mappings! <br/>
                            We are looking forward to your contributions. <br/>
                            Please remember to check the help pages to get information on how to start mapping.
                        </p>


                    </div>
                </div>


            </Layout>
        );
    }
}

SignupPage.propTypes = propTypes;


module.exports = SignupPage;
