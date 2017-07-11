'use strict';
const Navbar = require('./navbar.jsx');
const PropTypes = require('prop-types');
const React = require('react');


const propTypes = {
    activeTab: PropTypes.string,
    children: PropTypes.node,
    feet: PropTypes.node,
    neck: PropTypes.node,
    title: PropTypes.string,
    credentials: PropTypes.object
};

class DefaultLayout extends React.Component {







    render() {


        const userInfo = this.props.credentials ? this.props.credentials.user : undefined;
        //This inserts, in addition to the children, a hidden span with the JSON of user information
        //used to personalize the interface.
        //Communication method of this information to the frontend should be done in a better way
        //but I don't come up with anything... Other alternative is that frontend makes a GET to ask for user
        //details but this is far more efficient.
        const childrenWithProps =
            <div>
                {this.props.children}
                <span id="userInformation" style={ { display: 'none' } }>{JSON.stringify(userInfo)}</span>
            </div>;



        const year = new Date().getFullYear();

        return (
            <html>
                <head>

                    <title>{this.props.title}</title>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link rel="stylesheet" href="/public/core.min.css" />
                    <link rel="stylesheet" href="/public/layouts/default.min.css" />
                    <link rel="shortcut icon" href="/public/media/favicon.ico" />
                    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
                    <script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
                    {this.props.neck}
                </head>
                <body>
                    <Navbar activeTab={this.props.activeTab} credentials={this.props.credentials}/>
                    <div className="page">
                        <div className="container">
                            {childrenWithProps}
                        </div>
                    </div>
                    <div className="footer">
                        <div className="container">
                            <span className="copyright pull-right">
                                &copy; {year} DBpedia
                            </span>
                            <ul className="links">
                                <li><a href="/">Home</a></li>

                            </ul>
                            <div className="clearfix"></div>
                        </div>
                    </div>
                    <script src="/public/core.min.js"></script>

                    {this.props.feet}
                </body>

            </html>
        );
    }
}

DefaultLayout.propTypes = propTypes;


module.exports = DefaultLayout;
