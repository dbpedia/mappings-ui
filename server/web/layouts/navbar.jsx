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
            isAdmin: this.props.credentials && this.props.credentials.user && '111111111111111111111111' in this.props.credentials.user.groups,
            permissions: this.props.credentials && this.props.credentials.user && this.props.credentials.user.permissions
        };


    }


    tabClass(tab) {

        return ClassNames({
            active: this.props.activeTab === tab
        });
    }




    hasPermission(perm){

        return this.state.permissions && this.state.permissions[perm];
    }

    render() {

        return (
            <div className="navbar navbar-default navbar-fixed-top">
                <div className="container">
                    <div className="navbar-header">
                        <a className="navbar-brand" href="/">
                            <img
                                className="navbar-logo"
                                src="/public/media/navbar-logo.png"
                            />
                            <span className="navbar-brand-label">Mappings UI</span>
                        </a>
                    </div>
                    <div className="navbar-collapse collapse">
                        <ul className="nav navbar-nav">
                            <li className={this.tabClass('home')}>
                                <a href="/">Home</a>
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
                            { (this.state.isAdmin || this.hasPermission('can-list-posts')) &&
                            <li className={this.tabClass('posts')}>
                                <a href="/posts">Posts</a>
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
