import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}

var ContentEditable = React.createClass({
    render(){
        return <h1 
            onInput={this.emitChange} 
            onBlur={this.emitChange}
            contentEditable
            dangerouslySetInnerHTML={{__html: this.props.html}}></h1>;
    },
    shouldComponentUpdate(nextProps){
        return nextProps.html !== ReactDOM.findDOMNode(this).innerHTML;
    },
    emitChange: function(){
        var html = ReactDOM.findDOMNode(this).innerHTML;
        if (this.props.onChange && (html !== this.lastHtml)) {
            this.props.onChange({
                target: {
                    value: html
                }
            });
        }
        this.lastHtml = html;
    }
});

export default class Controls extends Component {
	constructor(props) {
        super(props);

        if ('title' in this.props.cluster) {
        	var initial_title =  this.props.cluster.title;
        } else {
        	var corrected_time = moment(this.props.cluster.start_time.utc_timestamp).utcOffset(this.props.cluster.start_time.tz_offset/60);
        	var initial_title = corrected_time.format('MMMM Do YYYY');
        }
        this.state = {
          html: initial_title
        };
    }

	back() {
		var date = new moment(this.props.cluster.start_time.utc_timestamp);
		FlowRouter.go("/clusters/" + date.format("YYYY-MM-DD"));
	}

	reset() {
		Meteor.call('conversation.resetHistory', this.props.cluster._id);
	}

    toCompose() {
        FlowRouter.go('/compose/' + this.props.cluster._id);
    }

	handleChange(event) {
	    this.setState({html: event.target.value});

	    Meteor.call('conversation.setTitle', this.props.cluster._id._str, event.target.value);
	}

	render() {
		if (this.props.debug) {
			var debug = [<div>{this.props.state}</div>, <button className="reset-button" onClick={this.reset.bind(this)}>Reset conversation</button>];
		} else {
			var debug = [];
		}

		return(
			<div className="cluster-conversation-controls">
        		<button className="back-button" onClick={this.back.bind(this)}><img src="/icons/back.png" /><div>Back</div></button>
        		<ContentEditable html={this.state.html} onChange={this.handleChange.bind(this)} />
        		<button className="compose-button" onClick={this.toCompose.bind(this)}><img src="/icons/Quill With Ink-100.png" /><div>Start Composing</div></button>
        		{debug}
        	</div>
        );
	}
}

Controls.propTypes = {
	debug: PropTypes.bool.isRequired,
	cluster: PropTypes.object.isRequired,
	state: PropTypes.string
};