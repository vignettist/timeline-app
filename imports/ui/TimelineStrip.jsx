import React, { Component, PropTypes } from 'react';
import TimelineStripImage from './TimelineStripImage.jsx';
import ReactDOM from 'react-dom';

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
		refdom = ReactDOM.findDOMNode(ref);
		box = refdom.getBoundingClientRect();
		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		scroll.scrollTo(scrollTop + box.top - 150, {duration: 1000, delay: 100, smooth: true});
	}

	render() {
		if (this.props.photos.length > 0) {
			var unhighlighted_default = (this.props.highlighted.length > 0) ? 'unhighlighted story-image' : 'story-image';

			var first_highlighted = true;

			var images_in_row = [];
			var rows = [];
			var rejects = [];
			var images_in_rejects_row = [];

			for (var i = 0; i < this.props.photos.length; i += 1) {
				if ('rating' in this.props.photos[i]) {
					var rating = this.props.photos[i].rating;
				} else {
					var rating = 2;
				}

				if (rating == 2) {
					if (images_in_row.length == 0) {
						images_in_row.push(<TimelineStripImage ref={this.props.photos[i]._id._str} photo={this.props.photos[i]} outerClass="timeline-strip-left" highlighted={(this.props.highlighted.indexOf(this.props.photos[i]._id._str) > -1)} unhighlighted={unhighlighted_default} callback={this.props.callback} />);
					} else if (images_in_row.length == 1) {
						images_in_row.push(<TimelineStripImage ref={this.props.photos[i]._id._str} photo={this.props.photos[i]} outerClass="timeline-strip-right" highlighted={this.props.highlighted.indexOf(this.props.photos[i]._id._str) > -1} unhighlighted={unhighlighted_default} callback={this.props.callback} />);
					}

					if (images_in_row.length == 2) {
						rows.push(<div className="timeline-strip-row">{images_in_row}</div>);
						images_in_row = [];
					}
				} else if (rating == 3) {
					rows.push(<div className="timeline-strip-row">
							  <TimelineStripImage ref={this.props.photos[i]._id._str} photo={this.props.photos[i]} outerClass="timeline-strip-full" highlighted={this.props.highlighted.indexOf(this.props.photos[i]._id._str) > -1} unhighlighted={unhighlighted_default} callback={this.props.callback}/>
					          </div>);
				} else if (rating == 1) {
					if (images_in_rejects_row.length == 0) {
						images_in_rejects_row.push(<TimelineStripImage ref={this.props.photos[i]._id._str} photo={this.props.photos[i]} outerClass="timeline-strip-left" highlighted={this.props.highlighted.indexOf(this.props.photos[i]._id._str) > -1} unhighlighted={unhighlighted_default} callback={this.props.callback}/>);
					} else if (images_in_rejects_row.length == 1) {
						images_in_rejects_row.push(<TimelineStripImage ref={this.props.photos[i]._id._str} photo={this.props.photos[i]} outerClass="timeline-strip-right" highlighted={this.props.highlighted.indexOf(this.props.photos[i]._id._str) > -1} unhighlighted={unhighlighted_default} callback={this.props.callback}/>);
					}

					if (images_in_rejects_row.length == 2) {
						rejects.push(<div className="timeline-strip-row">{images_in_rejects_row}</div>);
						images_in_rejects_row = [];
					}
				}

			}

			if (images_in_row.length > 0) {
				rows.push(<div className="timeline-strip-row">{images_in_row}</div>);
			}

			if (images_in_rejects_row.length > 0) {
				rejects.push(<div className="timeline-strip-row">{images_in_rejects_row}</div>);
			}

		} else {
			var rows = [];
			var rejects = [];
		}

		return(
			<div className="timeline-strip">
        		{rows}
        		<div className="divider">Set aside images</div>
        		{rejects}
        	</div>
        );
	}
}

TimelineStrip.propTypes = {
	photos: PropTypes.array.isRequired,
	highlighted: PropTypes.array.isRequired,
	callback: PropTypes.func.isRequired
};