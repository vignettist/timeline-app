import React, { Component, PropTypes } from 'react';

export default class StoryParagraph extends Component {
	// on initial render, set focus and select all

	render() {
        return <div
        	ref={(input) => { this.divWrapper = input; }}
            onInput={this.emitChange.bind(this)} 
            onBlur={this.emitChange.bind(this)}
            contentEditable
            dangerouslySetInnerHTML={{__html: this.props.html}}></div>;
    }

    componentDidMount() {
        if (this.props.selected) {
            this.divWrapper.focus();
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(this.divWrapper.childNodes[0], 0);
            range.setEnd(this.divWrapper.childNodes[0], 1);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }

    shouldComponentUpdate(nextProps) {
        return (nextProps.html !== this.divWrapper.innerHTML);
    }

    emitChange() {
    	var html = this.divWrapper.innerHTML;

        if (this.props.onChange && (html !== this.lastHtml)) {
            this.props.onChange({
                target: {
                    value: html
                }
            });

        }
        this.lastHtml = html;
    }
}

StoryParagraph.propTypes = {
	html: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
    selected: PropTypes.bool
};