import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import {Clusters, LogicalImages} from '../api/photos.js';
import {Conversations} from '../api/conversation.js';
import TextMessage from './Conversation/TextMessage.jsx';
import TextInputMessage from './Conversation/TextInputMessage.jsx';
import TimelineStrip from './TimelineStrip.jsx';
import Controls from './Controls.jsx';

const DELAY_TIME = 1000;

export class ClusterConversation extends Component {
    constructor(props) {
        super(props);

        this.state = {
          pending: false,
          currentImage: undefined,
        };
    }

    autoSubmit() {
      var update = this.autoTransition();

      // if there is an automatic state transition and we're not currently waiting for a state transition (to avoid infinite loops)
      if ((update != 'none') && (this.state.pending === false)) {
        var transition = function() {
          Meteor.call('conversation.addHistory', this.props.cluster._id, update.output, update.newState);
        }.bind(this);

        // add a 1.5 second delay to make it seem more natural
        setTimeout(transition.bind(update), DELAY_TIME);
        this.setState({pending: true});
      }
    }

    componentWillReceiveProps(newProps) {
      // when new a new chat state is arriving, disable pending indicator
      if (newProps.conversation.history.length > 0) {
        if (newProps.conversation.history[newProps.conversation.history.length-1].from == 'app') {
          this.setState({pending: false});
        }
      }
    }

    componentDidUpdate() {
      this.autoSubmit();
    }

    // some states should automatically transition into another one
    autoTransition() {
      if (typeof this.props.conversation !== 'undefined') {
        switch(this.props.conversation.state) {
          case 'init':
            var corrected_time = moment(this.props.cluster.start_time.utc_timestamp).utcOffset(this.props.cluster.start_time.tz_offset/60);
            var content = "Hi! Let's talk about the day you spent in " + this.props.cluster.location + " on " + corrected_time.format('MMMM Do YYYY') + ".";
            return({output: {from: 'app', content: content}, newState: 'unrecognized_person'});

          case 'unrecognized_person':
            if (this.props.cluster.faces.length > 0) {
              var newState = 'person_in_photo';
              var content = "I see some people I don't recognize.";
            } else {
              var newState = 'no_comment';
              var content = "I don't have anything to ask you right now."
            }
            return({output: {from: 'app', content: content}, newState: newState});

          case 'person_in_photo':
            return({output: {from: 'app', content: 'Who is this?'}, newState: 'determining_name'});

          default:
            return('none');
        }
      } else {
        return 'none';
      }
    }

    // some transitions are triggered by input
    stateTransition(text) {
      switch(this.props.conversation.state) {
        case 'determining_name':
          Meteor.call('conversation.whoIs', text, (err, names) => {
            if (err) {
              alert(err);
            } else {
              if (names.length == 0) {
                var content =  "Sorry, I'm not sure I got that. Is there a person in this image?";
                var newState = 'are_there_people';
              } else if (names.length == 1) {
                var content = "Oh, so that's " + names[0] + "?";
                var newState = 'confirming_person';
              } else if (names.length > 1) {
                var listed_names = names.reduce(function(list, n, i, a) {
                  if (i == a.length - 1) {
                    return list + " or " + n
                  } else {
                    return list + ", " + n
                  }
                });
                var content = "Wait, is that " + listed_names + "?";
                var newState = 'determining_name';
              }

              var transition = function() {
                Meteor.call('conversation.addHistory', this.props.cluster._id, update.output, update.newState);
              }.bind(this);

              var update = {output: {from: 'app', content: content}, newState: newState};
              setTimeout(transition.bind(update), DELAY_TIME);

            }
          });
          break;

        case 'confirming_person':
          Meteor.call('conversation.confirm', text, (err, yn) => {
            if (err) {
              alert(err);
            } else {
              this.setState({pending: false});
              if (yn) {
                content = 'Awesome. Computer out.';
                newState = 'no_comment';
              } else {
                content = 'Oh, so who is it?';
                newState = 'determining_name';
              }

              var transition = function() {
                Meteor.call('conversation.addHistory', this.props.cluster._id, update.output, update.newState);
              }.bind(this);

              var update = {output: {from: 'app', content: content}, newState: newState};
              setTimeout(transition.bind(update), DELAY_TIME);

            }
          })
          break;

        case 'are_there_people':
          console.log('are_there_people');
          break;

        case 'determining_name':
          console.log('determining_name');
          break;
      }
    }

    handleSubmit(event) {
      event.preventDefault();

      var inputBox = ReactDOM.findDOMNode(this.refs.textInput.refs.textInput);
      const text = inputBox.value.trim();

      // check to make sure that the user typed anything
      if (typeof text !== 'undefined') {
        inputBox.value = '';
        console.log('set pending true in handleSubmit');
        this.setState({pending: true});
        Meteor.call('conversation.addHistory', this.props.cluster._id, {from: 'user', content: text}, this.props.conversation.state);

        this.stateTransition(text);
      }
    }

  render() {
    if (typeof this.props.conversation !== 'undefined') {
      var state = this.props.conversation.state;

      var conversation = this.props.conversation.history.map(function(m) {
        if (m.from == 'app') {
          return <TextMessage idTag="computer-side" content={m.content} />
        } else {
          return <TextMessage idTag="human-side" content={m.content} />
        }
      });

      if (this.state.pending) {
        var post_conversation = <TextMessage idTag="computer-side" content="..." />;
      } else {
        var post_conversation = <TextInputMessage ref="textInput" onSubmit={this.handleSubmit.bind(this)} />;
      }


      return (
          <div className="cluster-conversation-wrapper">
            <Controls debug={true} cluster={this.props.cluster} />
            <TimelineStrip photos={this.props.photos} />
            <div className="cluster-conversation">
              {conversation}
              {post_conversation}
            </div>
          </div>
      );
    } else {
      return <div>Loading...</div>
    }
  }
}
 
ClusterConversation.propTypes = {
  conversation: PropTypes.object.isRequired,
  cluster: PropTypes.object.isRequired,
  photos: PropTypes.object.isRequired
};

export default createContainer(() => {
  return {
    conversation: Conversations.find({}).fetch()[0],
    cluster: Clusters.find({}).fetch()[0],
    photos: LogicalImages.find({}).fetch()
  };

}, ClusterConversation);

