import React, { Component, PropTypes } from 'react';

export default class Controls extends Component {
	back() {
		 FlowRouter.go(this.props.backUrl);
	}

	reset() {
		Meteor.call('conversation.resetHistory', this.props.cluster._id);
	}

	render() {
		console.log(this.props);

		if (this.props.debug) {
			var debug = <button className="reset-button" onClick={this.reset.bind(this)}>Reset conversation</button>
		} else {
			var debug = [];
		}

		return(
			<div className="cluster-conversation-controls">
        		<button className="back-button" onClick={this.back.bind(this)}>Back</button>
        		{debug}
        	</div>
        );
	}
}

Controls.propTypes = {
	debug: PropTypes.bool.isRequired,
	backUrl: PropTypes.string.isRequired
};