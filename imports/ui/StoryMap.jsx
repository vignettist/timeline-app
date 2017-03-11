import React, { Component, PropTypes } from 'react';
import ClusterMap from './ClusterMap.jsx';

export default class StoryMap extends Component {
	render() {
		return <div className="compose-map">
					<ClusterMap cluster={this.props.cluster} photos={this.props.photos} offset={false} height={400} width={750} />
					<button className="delete-button" onClick={this.props.callback}><img src="/icons/X.png" /></button>
				</div>
	}
}

StoryMap.propTypes = {
	cluster: PropTypes.object.isRequired,
	photos: PropTypes.array.isRequired,
	callback: PropTypes.func.isRequired
};