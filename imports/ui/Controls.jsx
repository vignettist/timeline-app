import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import StoryHeading from './StoryHeading.jsx';

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

export default class Controls extends Component {
	back() {
        console.log(this.props.cluster);
        var date = new moment(this.props.cluster.start_time.utc_timestamp).utcOffset(this.props.cluster.start_time.tz_offset/60);
		FlowRouter.go("/clusters/" + date.format("YYYY-MM-DD"));
	}

	reset() {
		Meteor.call('conversation.resetHistory', this.props.cluster._id);
	}

    toCompose() {
        FlowRouter.go('/compose/' + this.props.cluster._id);
    }

	handleChange(event) {
	    Meteor.call('conversation.setTitle', this.props.cluster._id._str, event.target.value);
	}

    splitCluster() {
        Meteor.call('clusters.split', this.props.cluster._id._str);
        this.back();
    }

	render() {
		if (this.props.debug) {
			var debug = [<div>{this.props.state}</div>, <button className="reset-button" onClick={this.reset.bind(this)}>Reset conversation</button>];
		} else {
			var debug = [];
		}

        if (this.props.storyStarted) {
            var compose_verb = 'Continue';
        } else {
            var compose_verb = 'Start';
        }

        var corrected_time = moment(this.props.cluster.start_time.utc_timestamp).utcOffset(this.props.cluster.start_time.tz_offset/60);
        var initial_title = corrected_time.format('MMMM Do YYYY');

        var split_button = [];

        if (this.props.allowSplit) {
            var split_button = <button className="split-button" onClick={this.splitCluster.bind(this)}><img src="/icons/split.png" /><div>Split Cluster</div></button>;
        } else {
            var split_button = <button className="split-button disabled"><img src="/icons/split.png" /><div>Split Cluster</div></button>
        }

		return(
			<div className="cluster-conversation-controls">
        		<button className="back-button" onClick={this.back.bind(this)}><img src="/icons/back.png" /><div>Back</div></button>
                <StoryHeading ref={"conversation_title"}
                              html={('title' in this.props.cluster) ? this.props.cluster.title : initial_title }
                              onChange={this.handleChange.bind(this)}
                              isTitle={true} />
                <button className="compose-button" onClick={this.toCompose.bind(this)}><img src="/icons/Quill With Ink-100.png" /><div>{compose_verb} Writing</div></button>
                {split_button}
        		{debug}
        	</div>
        );
	}
}

Controls.propTypes = {
	debug: PropTypes.bool.isRequired,
	cluster: PropTypes.object.isRequired,
	state: PropTypes.string,
    storyStarted: PropTypes.bool.isRequired,
    allowSplit: PropTypes.bool.isRequired
};