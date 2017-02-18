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

		var corrected_time = moment(this.props.cluster.start_time.utc_timestamp).utcOffset(this.props.cluster.start_time.tz_offset/60);

		return(
			<div className="cluster-conversation-controls">
        		<button className="back-button" onClick={this.back.bind(this)}><img src="/icons/back.png" /><div>Back</div></button>
        		<h1>{corrected_time.format('MMMM Do YYYY')}</h1>
        		<button className="compose-button"><img src="/icons/Quill With Ink-100.png" /><div>Start Composing</div></button>
        		{debug}
        	</div>
        );
	}
}

Controls.propTypes = {
	debug: PropTypes.bool.isRequired,
	cluster: PropTypes.object.isRequired
};