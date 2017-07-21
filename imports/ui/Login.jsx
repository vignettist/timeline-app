import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

class NewUser extends Component {
	constructor(props) {
		super(props);

		this.state = {failed: false, animate: false};
	}

	handleCreate(event) {
		event.preventDefault();

		var password = ReactDOM.findDOMNode(this.refs.loginpassword).value;
		var username = ReactDOM.findDOMNode(this.refs.username).value;

		var callback = function(err) {
			if (err) {
				console.log(err);
				this.setState({failed: err.reason, animate: true})
			} else {
				console.log("created new user");
			}

			return false
		};

		Accounts.createUser({username: username, password: password}, callback.bind(this));
	}

	render() {
		if (this.state.failed) {
			var error_message = this.state.failed;
		} else {
			var error_message = [];
		}

		class_name = "user-box selected";

		if (this.state.animate) {
			class_name += " failed";

			var reset = function() {
				this.setState({animate: false});
			}

			setTimeout(reset.bind(this), 100);
		}

		return <div className={class_name} key="new-user">
            <form id="login-form" onSubmit={this.handleCreate.bind(this)}>
		      <div>
		      	<input type="text" ref="username" placeholder="User name"/>
		        <input type="password" ref="loginpassword" placeholder="Password"/>
		        <input type="submit" ref="loginbutton" value="Create account" />
		        {error_message}
		     </div>
		   </form>
        </div>
	}
}

class User extends Component {
	constructor(props) {
		super(props);

		this.state = {
			failed: false,
			animate: false
		}
	}

	handleLogin(event) {
		event.preventDefault();

		var username = this.props.user.username;
		var password = ReactDOM.findDOMNode(this.refs.loginpassword).value;

		var response = function(err) {
			if (err) {
				console.log(err);
				this.setState({failed: true, animate: true});
			} else {
				console.log("succesful login");
			}

			return false;
		};

		Meteor.loginWithPassword(username, password, response.bind(this));
	}	

	render() {
		var class_name = "user-box";
    	var login = [];
    	if (this.props.selected) {
    		class_name += " selected";
    		
    		if (this.state.failed) {
    			error_message = <span>Incorrect password.</span>;
    		} else {
    			error_message = [];
    		}

    		if (this.state.animate) {
    			class_name += " failed";

    			var reset = function() {
    				this.setState({animate: false});
    			}

    			setTimeout(reset.bind(this), 100);
    		}

    		login = <form id="login-form" onSubmit={this.handleLogin.bind(this)}>
		      <div>
		        <input type="password" ref="loginpassword" placeholder="password"/>
		        <input type="submit" ref="loginbutton" value="Sign in" />
		        {error_message}
		     </div>
		   </form> ;
    	}

        return <div className={class_name} key={this.props.user._id} onClick={this.props.onClick}>
            {this.props.user.username}
            {login}
        </div>
	}
}

export class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			user: -1,
			create: false
    	};
	}

	setUser(u) {
		this.setState({user: u});
	}

	clearUser() {
		this.setState({user: -1, create: false});
	}

	newUser() {
		this.setState({create: true})
	}

	render() {

		if (this.state.create) {
			return <div className="login-page">
					<div className="user-list">
						<h2>Vignette</h2>
						<h3>Create a new user.</h3>
					<div className="back-button" onClick={this.clearUser.bind(this)}>
						<img src="/icons/back.png" />User list
					</div>
					<NewUser />
					</div>
				</div>

		} else {
			if (this.state.user >= 0) {
				return <div className="login-page">
					<div className="user-list">
					<h2>Vignette</h2>
					<div className="back-button" onClick={this.clearUser.bind(this)}>
						<img src="/icons/back.png" />User list
					</div>
					<User key={this.props.users[this.state.user].username} selected={true} user={this.props.users[this.state.user]} />
					</div>
					</div>;
			} else {
				return	<div className="login-page">
						<div className="user-list">
							<h2>Vignette</h2>
							<h3>Select a user.</h3>
							{this.props.users.map(function(u,i) { return <User key={u.username} selected={false} user={u} onClick={this.setUser.bind(this, i)} /> }, this) }
							<div className="user-box new" onClick={this.newUser.bind(this)}>
								<img src="icons/Plus-100.png" />
								<span>New user</span>
							</div>
						</div>
					</div>;
			}
		}
	}


}

Login.propTypes = {
	users: PropTypes.array.isRequired
};

export default createContainer(() => {
  return {
    users: Meteor.users.find({}).fetch(),
  };

}, Login);