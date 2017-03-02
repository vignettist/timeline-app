import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import {Clusters, LogicalImages, Places, Stories} from '../api/photos.js';
import {Conversations} from '../api/conversation.js';
import AddButton from './AddButton.jsx';
// import {Stories} from '../api/stories.js';
import TimelineStrip from './TimelineStrip.jsx';

export class Compose extends Component {
	constructor(props) {
        super(props);

        this.state = {
          selectingImage: false,
        };
    }

	insertNewContent(position, contentType) {
		console.log("inserting new content");
		console.log(contentType);
		console.log(position);

		if (contentType === 'add-header') {
			Meteor.call('story.insertHeader', this.props.story[0]._id, position+1);
			this.setState({'selectingImage': false});
		} else if (contentType === 'add-text') {
			Meteor.call('story.insertParagraph', this.props.story[0]._id, position+1);
			this.setState({'selectingImage': false});
		} else if (contentType === 'add-image') {
			this.setState({'selectingImage': true, 'newImagePosition': position+1});
		}
	}

	photoCallback(photo) {
		console.log(photo);
		Meteor.call('story.insertImage', this.props.story[0]._id, photo, this.state.newImagePosition);
	}

	cancelPhotoInsert() {
		this.setState({'selectingImage': false});
	}

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

				composeContent.push(<AddButton key={"add_button_" + i + this.props.story[0]._id} callback={this.insertNewContent.bind(this, i)} />);
			}

			if (this.state.selectingImage) {
				var strip = <TimelineStrip closeCallback={this.cancelPhotoInsert.bind(this)} displayRejects={false} displayRating={false} photos={this.props.photos} highlighted={[]} callback={this.photoCallback.bind(this)} />;
			} else {
				var strip = [];
			}

			return  <div className="compose-wrapper">
						{strip}
						<div className={"compose-story" + (this.state.selectingImage ? " picker-active" : "")}>
						{composeContent}
						</div>
					</div>
		} else {
			return <div>...</div>
		}
	}
}

Compose.propTypes = {
  conversation: PropTypes.object.isRequired,
  cluster: PropTypes.object.isRequired,
  photos: PropTypes.object.isRequired,
  places: PropTypes.array.isRequired,
  story: PropTypes.object.isRequired
};

export default createContainer(() => {
  return {
    conversation: Conversations.find({}).fetch(),
    cluster: Clusters.find({}).fetch(),
    photos: LogicalImages.find({}).fetch(),
    places: Places.find({}).fetch(),
    story: Stories.find({}).fetch()
  };

}, Compose);

