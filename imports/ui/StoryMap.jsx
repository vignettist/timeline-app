import React, { Component, PropTypes } from 'react';
import ClusterMap from './ClusterMap.jsx';

export default class StoryMap extends Component {
	updateMapPosition(event) {
		var bounds = event.target.getBounds();
		var boundsArray = [[bounds.getSouth(), bounds.getWest()], [bounds.getNorth(), bounds.getEast()]];
		this.props.callback(boundsArray);
	}

	render() {
		if (!('bounds' in this.props)) {
			return <div className="compose-map">
					<ClusterMap cluster={this.props.cluster} photos={this.props.photos} offset={false} height={400} width={750} callback={this.updateMapPosition.bind(this)} />
					<button className="delete-button" onClick={this.props.deleteCallback}><img src="/icons/X.png" /></button>
					</div>
		} else {
			return <div className="compose-map">
					<ClusterMap cluster={this.props.cluster} photos={this.props.photos} offset={false} height={400} width={750} callback={this.updateMapPosition.bind(this)} bounds={this.props.bounds}/>
					<button className="delete-button" onClick={this.props.deleteCallback}><img src="/icons/X.png" /></button>
					</div>
		}
	}
}

StoryMap.propTypes = {
	cluster: PropTypes.object.isRequired,
	photos: PropTypes.array.isRequired,
	deleteCallback: PropTypes.func.isRequired,
	callback: PropTypes.func.isRequired
};