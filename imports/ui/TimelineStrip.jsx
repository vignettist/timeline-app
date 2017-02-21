import React, { Component, PropTypes } from 'react';

var Scroll  = require('react-scroll');
var scroll     = Scroll.animateScroll;

export default class TimelineStrip extends Component {
	componentDidMount() {
		if (this.props.highlighted.length > 0) {
			this.scrollToHighlight(this.refs[this.props.highlighted[0]]);
		}
	}

	componentDidUpdate() {
		if (this.props.highlighted.length > 0) {
			this.scrollToHighlight(this.refs[this.props.highlighted[0]]);
		}
	}

	scrollToHighlight(ref) {
		box = ref.getBoundingClientRect();
		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		scroll.scrollTo(scrollTop + box.top - 150, {duration: 1000, delay: 100, smooth: true});
	}

	handleCallback(photo) {
		console.log(photo);
		this.props.callback(photo);
	}

	render() {
		if (this.props.photos.length > 0) {
			var photos_list = [];

			var unhighlighted_default = (this.props.highlighted.length > 0) ? 'unhighlighted' : '';

			var first_highlighted = true;

			for (var i = 0; i < this.props.photos.length; i += 2) {
				if (i != this.props.photos.length - 1) {
					photos_list.push(<div className="timeline-strip-row">
										<div className="timeline-strip-left">
											<img onClick={this.handleCallback.bind(this, this.props.photos[i]._id._str)} ref={this.props.photos[i]._id._str} className={this.props.highlighted.indexOf(this.props.photos[i]._id._str) > -1 ? 'highlighted' : unhighlighted_default} src={"http://localhost:3022/" + this.props.photos[i].resized_uris[640]} />
										</div>
										<div className="timeline-strip-right">
											<img onClick={this.handleCallback.bind(this, this.props.photos[i+1]._id._str)} ref={this.props.photos[i+1]._id._str} className={this.props.highlighted.indexOf(this.props.photos[i+1]._id._str) > -1 ? 'highlighted' : unhighlighted_default} src={"http://localhost:3022/" + this.props.photos[i+1].resized_uris[640]} />
										</div>
									</div>);
				} else {
					photos_list.push(<div className="timeline-strip-row">
										<div className="timeline-strip-left">
											<img onClick={this.handleCallback.bind(this, this.props.photos[i]._id._str)} ref={this.props.photos[i]._id._str} className={this.props.highlighted.indexOf(this.props.photos[i]._id._str) > -1 ? 'highlighted' : unhighlighted_default} src={"http://localhost:3022/" + this.props.photos[i].resized_uris[640]} />
										</div>
									</div>);
				}
			}

		} else {
			var photos_list = [];
		}

		return(
			<div className="timeline-strip">
        		{photos_list}
        	</div>
        );
	}
}

TimelineStrip.propTypes = {
	photos: PropTypes.array.isRequired,
	highlighted: PropTypes.array.isRequired,
	callback: PropTypes.object
};