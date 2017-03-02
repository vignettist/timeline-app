import React, { Component, PropTypes } from 'react';

export default class TimelineStripMessage extends Component {
	handleCallback() {
		console.log(this.props.photo._id._str);
		this.props.callback(this.props.photo._id._str);
	}

	thumbsDown() {
		if ('rating' in this.props.photo) {
			var rating = this.props.photo.rating - 1;
		} else {
			var rating = 1;
		}

		if (rating < 1) { rating = 1; }

		Meteor.call('conversation.rateImage', this.props.photo._id._str, rating);	}

	thumbsUp() {
		if ('rating' in this.props.photo) {
			var rating = this.props.photo.rating + 1;
		} else {
			var rating = 3;
		}

		if (rating > 3) { rating = 3; }

		Meteor.call('conversation.rateImage', this.props.photo._id._str, rating);
	}

	render() {
		if (this.props.displayRating) {
			var rating =  <div className="rating-controls">
			       <button onClick={this.thumbsUp.bind(this)}><img src="/icons/thumbup.png" /></button>
			       <button onClick={this.thumbsDown.bind(this)}><img src="/icons/thumbdown.png" /></button>
			   </div>;
		} else {
			var rating = [];
		}

		return  <div className={this.props.outerClass + " " + (this.props.highlighted ? '' : this.props.unhighlighted)}>
			    <img id={this.props.photo._id._str} 
			   		 onClick={this.handleCallback.bind(this)}
			   		 className={this.props.highlighted ? 'highlighted story-image' : this.props.unhighlighted}
			   		 src={"http://localhost:3022/" + this.props.photo.resized_uris[640]} />

		      	{rating}

		       </div>
	}
}

TimelineStripMessage.propTypes = {
	photo: PropTypes.object.isRequired,
	outerClass: PropTypes.string.isRequired,
	highlighted: PropTypes.bool.isRequired,
	unhighlighted: PropTypes.string.isRequired,
	callback: PropTypes.func.isRequired,
	displayRating: PropTypes.bool.isRequired
};