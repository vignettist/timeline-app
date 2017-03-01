import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, LogicalImages, Places, Stories} from '../api/photos.js';
import {Conversations} from '../api/conversation.js';
// import {Stories} from '../api/stories.js';

var AddButton = React.createClass({
	render() {
		return <div className="divider">
					<div className="add">
						<img src="/icons/Plus-100.png" />
					</div>
				</div>
	}
})

export class Compose extends Component {
	render() {
		var composeContent = [];

		if (this.props.story.length > 0) {
			var story = this.props.story[0].content;


			for (var i = 0; i < story.length; i++) {
				if (story[i].type === 'heading') {
					composeContent.push(<div className="heading"><h1>{story[i].data}</h1></div>);
				} else if (story[i].type === 'paragraph') {
					var renderedParagraphs = [];

					for (var j = 0; j < story[i].data.length; j++) {
						renderedParagraphs.push(<p>{story[i].data[j]}</p>);
					}
					composeContent.push(<div className="content">{renderedParagraphs}</div>);
				} else if (story[i].type === 'image') {
					composeContent.push(<div className="compose-image"><img src={"http://localhost:3022/" + story[i].data.resized_uris[1280]} /></div>);
				}

				composeContent.push(<AddButton />);
			}

			return <div className="compose-wrapper">
					{composeContent}
					</div>
		} else {
			return <div>...</div>
		}
	}
}

Compose.propTypes = {
  conversation: PropTypes.object.isRequired,
  cluster: PropTypes.object.isRequired,
  // photos: PropTypes.object.isRequired,
  places: PropTypes.array.isRequired,
  stories: PropTypes.object.isRequired
};

export default createContainer(() => {
  return {
    conversation: Conversations.find({}).fetch(),
    cluster: Clusters.find({}).fetch(),
    // photos: LogicalImages.find({}).fetch(),
    places: Places.find({}).fetch(),
    story: Stories.find({}).fetch()
  };

}, Compose);

