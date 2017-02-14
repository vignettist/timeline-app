import React, { Component, PropTypes } from 'react';

export default class TimelineStrip extends Component {
	render() {
		if (this.props.photos.length > 0) {
			var photos_list = this.props.photos.map(function(p) {
				return <img src={"http://localhost:3022/" + p.resized_uris[160]} />
			})
		} else {
			var photos_list = [];
		}

		return(
			<div className="timeline-strip">
        		{photos_list}
        	</div>
        );
	}
}

TimelineStrip.propTypes = {
	photos: PropTypes.array.isRequired
};