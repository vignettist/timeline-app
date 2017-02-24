import React, { Component, PropTypes } from 'react';

export default class TextInputMessage extends Component {
	render() {
		return(
			<div className="conversation input human-side">
        		<form className="conversational-ui" onSubmit={this.props.onSubmit} >
					<input
						type="text"
						ref="textInput"
						placeholder="Type a response..."
						autofocus="autofocus"
					/>
        		</form>
        	</div>
        );
	}
}

TextInputMessage.propTypes = {
	onSubmit: PropTypes.object.isRequired
};