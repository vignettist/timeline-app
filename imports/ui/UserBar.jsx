import React, { Component, PropTypes } from 'react';
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data';

export class UserBar extends Component {
	logout() {
		Meteor.logout();
	}

	render() {
		if (this.props.user) {
			return <div className="user-bar-wrapper">
				<div className="user-bar">
					<div className="user-name">{this.props.user.username}</div>
					<div className="navigation">
						<div className="nav-button"><img src="/icons/home.png" /></div>
						<div className="nav-button"><img src="/icons/calendar.png" /></div>
						<div className="nav-button"><img src="/icons/map-dark.png" /></div>
						<div className="nav-button"><img src="/icons/people.png" /></div>
						<div className="nav-button"><img src="/icons/stories.png" /></div>
					</div>
					<div className="log-out" onClick={this.logout}>Sign out</div>
				</div> 
			</div>
		} else {
			return <div className="user-bar"></div>
		}

	}
}

UserBar.propTypes = {
	user: PropTypes.object.isRequired
};

export default createContainer(({ params }) => {
  return {
    user: Meteor.user(),
  };
}, UserBar);
