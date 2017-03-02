import React, { Component, PropTypes } from 'react';

export default class StoryImage extends Component {
	render() {
		return <div className="compose-image">
					<img src={this.props.uri} />
					<button className="delete-button" onClick={this.props.callback}><img src="/icons/X.png" /></button>
				</div>
	}
}

StoryImage.propTypes = {
	uri: PropTypes.string.isRequired,
	callback: PropTypes.func.isRequired
};