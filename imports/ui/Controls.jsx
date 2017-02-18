import React, { Component, PropTypes } from 'react';

export default class Controls extends Component {
	back() {
		var date = new moment(this.props.cluster.start_time.utc_timestamp);
		FlowRouter.go("/clusters/" + date.format("YYYY-MM-DDDD"));
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
        		<button className="compose-button">Start Composing</button>
        		{debug}
        	</div>
        );
	}
}

Controls.propTypes = {
	debug: PropTypes.bool.isRequired,
	cluster: PropTypes.object.isRequired
};