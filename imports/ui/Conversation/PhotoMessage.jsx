import React, { Component, PropTypes } from 'react';

export default class PhotoMessage extends Component {
	render() {
		return <div className={"conversation " + this.props.idTag}>
        	<img key={this.props.content._id + "_img"} src={"http://localhost:3022/" + this.props.content.resized_uris[320]} />
		</div>
	}
}

PhotoMessage.propTypes = {
	content: PropTypes.object.isRequired,
	idTag: PropTypes.string.isRequired
};