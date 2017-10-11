import React, { Component, PropTypes } from 'react';
import TextareaAutosize from 'react-autosize-textarea';

export default class TextInputMessage extends Component {
						// <input
					// 	type="text"
					// 	ref="textInput"
					// 	placeholder="Type a response..."
					// 	autoFocus="autofocus"
					// />

	onResize(event) {
		if(event.target.value[event.target.value.length-1] == '\n') {
			this.props.onSubmit(event.target.value.slice(0,event.target.value.length));
		}
	}
		
	render() {


		return(
			<div className="conversation input human-side">
        		<form className="conversational-ui" onSubmit={this.props.onSubmit} >
        			<TextareaAutosize
        				ref="textInput"
        				placeholder="Type a response..."
        				autoFocus="autofocus"
        				rows={1}
        				height={16}
        				onResize={this.onResize.bind(this)}
        			/>
        		</form>
        	</div>
        );
	}
}

TextInputMessage.propTypes = {
	onSubmit: PropTypes.func.isRequired
};