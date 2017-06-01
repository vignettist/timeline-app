import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import AccountsUIWrapper from './AccountsUIWrapper.jsx';

var User = React.createClass({
    render: function() {
        return <div className="user-box" key={this.props.user._id}>
            {this.props.user.username}
        </div>
    }
});

export class Login extends Component {
	render() {
		return	<div className="login-page">
					<AccountsUIWrapper />
					<div className="user-list">
						<h2>User list</h2>
						{this.props.users.map(function(u) { return <User user={u} /> }) }
					</div>
				</div>;
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