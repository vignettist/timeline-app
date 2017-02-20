import React, { Component, PropTypes } from 'react';

export default class TimelineStrip extends Component {
	render() {
		if (this.props.photos.length > 0) {
			var photos_list = [];

			for (var i = 0; i < this.props.photos.length; i += 2) {
				if (i != this.props.photos.length - 1) {
					photos_list.push(<div className="timeline-strip-row">
										<div className="timeline-strip-left">
											<img src={"http://localhost:3022/" + this.props.photos[i].resized_uris[640]} />
										</div>
										<div className="timeline-strip-right">
											<img src={"http://localhost:3022/" + this.props.photos[i+1].resized_uris[640]} />
										</div>
									</div>);
				} else {
					photos_list.push(<div className="timeline-strip-row">
										<div className="timeline-strip-left">
											<img src={"http://localhost:3022/" + this.props.photos[i].resized_uris[640]} />
										</div>
									</div>);
				}
			}

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