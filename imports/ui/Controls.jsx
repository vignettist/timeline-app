import React, { Component, PropTypes } from 'react';

export default class Controls extends Component {
	back() {
		var date = new moment(this.props.cluster.start_time.utc_timestamp);
		FlowRouter.go("/clusters/" + date.format("YYYY-MM-DD"));
	}

	reset() {
		Meteor.call('conversation.resetHistory', this.props.cluster._id);
	}

	render() {
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
        		<div>{this.props.state}</div>
        		{debug}
        	</div>
        );
	}
}

Controls.propTypes = {
	debug: PropTypes.bool.isRequired,
	cluster: PropTypes.object.isRequired,
	state: PropTypes.string
};