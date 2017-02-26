import React, { Component, PropTypes } from 'react';

export default class PhotoMessage extends Component {
	render() {
		if (typeof this.props.content !== "undefined") {
			return <div className={"conversation " + this.props.idTag}>
	        	<img key={this.props.content._id + "_img"} src={"http://localhost:3022/" + this.props.content.resized_uris[320]} />
			</div>
		} else {
			return <div className={"conversation " + this.props.idTag}>...</div>
		}
	}
}

PhotoMessage.propTypes = {
	content: PropTypes.object.isRequired,
	idTag: PropTypes.string.isRequired
};