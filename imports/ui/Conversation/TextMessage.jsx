import React, { Component, PropTypes } from 'react';

export default class TextMessage extends Component {
	render() {
		return <div className={"conversation " + this.props.idTag}>{this.props.content}</div>
	}
}

TextMessage.propTypes = {
	content: PropTypes.string.isRequired,
	idTag: PropTypes.string.isRequired
};