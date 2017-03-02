import React, { Component, PropTypes } from 'react';

export default class StoryHeading extends Component {
	// on initial render, set focus and select all
    // TODO ^

    componentDidMount() {
        this.initialHTML = this.props.html;
    }

	render() {
        return <div className="heading"><h1
        	ref={(input) => { this.divWrapper = input; }}
            onInput={this.emitChange.bind(this)} 
            onBlur={this.emitChange.bind(this)}
            contentEditable
            dangerouslySetInnerHTML={{__html: this.props.html}}
            ></h1></div>;
    }

    shouldComponentUpdate(nextProps) {
        return (nextProps.html !== this.divWrapper.innerHTML);
    }

    emitChange() {
    	var html = this.divWrapper.innerHTML;

        if (this.props.onChange && (html !== this.lastHtml)) {
            if (html === "" && this.props.isTitle) {
                //can't delete the title
                html = this.initialHTML;
                this.divWrapper.innerHTML = html;
                // this.divWrapper.setSelectionRange(this.divWrapper.innerText.length, this.divWrapper.innerText.length); 

                var range = document.createRange();
                var sel = window.getSelection();
                range.setStart(this.divWrapper.childNodes[0], html.length);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }

            this.props.onChange({
                target: {
                    value: html
                }
            });

        }
        this.lastHtml = html;
    }
}

StoryHeading.propTypes = {
	html: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    isTitle: PropTypes.bool.isRequired
};