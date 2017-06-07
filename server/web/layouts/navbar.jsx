'use strict';
const ClassNames = require('classnames');
const PropTypes = require('prop-types');
const React = require('react');



const propTypes = {
    activeTab: PropTypes.string,
    credentials: PropTypes.object
};




class Navbar extends React.Component {


    constructor(props){

        super(props);
        this.state = {
            isAuthenticated: this.props.credentials && this.props.credentials.user,
            username: this.props.credentials && this.props.credentials.user && this.props.credentials.user.username,
            isAdmin: this.props.credentials && this.props.credentials.user && 'admin' in this.props.credentials.user.groups
        };

    }


    tabClass(tab) {

        return ClassNames({
            active: this.props.activeTab === tab
        });
    }





    render() {

        return (
            <div className="navbar navbar-default navbar-fixed-top">
                <div className="container">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="/">
                            <img
                                className="navbar-logo"
                                src="/public/media/logo-square.png"
                            />
                            <span className="navbar-brand-label">Aqua</span>
                        </a>
                    </div>
                    <div className="navbar-collapse collapse">
                        <ul className="nav navbar-nav">
                            <li className={this.tabClass('home')}>
                                <a href="/">Home</a>
                            </li>

                            <li className={this.tabClass('contact')}>
                                <a href="/contact">Contact</a>
                            </li>
                            { this.state.isAdmin &&
                                <li className={this.tabClass('groups')}>
                                    <a href="/groups">Groups</a>
                                </li>
                            }
                            { this.state.isAdmin &&
                                <li className={this.tabClass('accounts')}>
                                    <a href="/accounts">Accounts</a>
                                </li>
                            }
                        </ul>
                        <ul className="nav navbar-nav navbar-right">


                            { this.state.isAdmin &&
                                <li className={this.tabClass('adminpanel')}>
                                    <a href="/adminpanel">Admin Panel</a>
                                </li>
                            }
                            { this.state.isAuthenticated &&
                                <li className={this.tabClass('profile')}>
                                    <a href="/profile">My Profile</a>
                                </li>
                            }
                            { this.state.isAuthenticated &&
                                <li className={this.tabClass('logout')}>
                                    <a href="/login/logout">Sign out</a>
                                </li>
                            }

                            { !this.state.isAuthenticated &&
                                <li className={this.tabClass('signup')}>
                                    <a href="/signup">Sign up</a>
                                </li>
                            }
                            { !this.state.isAuthenticated &&

                                <li className={this.tabClass('login')}>
                                    <a href="/login">Sign in</a>
                                </li>
                            }

                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

Navbar.propTypes = propTypes;


module.exports = Navbar;
