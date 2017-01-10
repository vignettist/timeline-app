import React, { Component, PropTypes } from 'react';

export default class DateButton extends Component {
	 render() {
		return (
		<button
		className="example-custom-input"
		onClick={this.props.onClick}>
		{this.props.value}
		</button>);
	}
}

DateButton.propTypes = {
	onClick: PropTypes.func,
	value: PropTypes.string
};