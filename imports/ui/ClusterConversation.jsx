import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import {Clusters, LogicalImages} from '../api/photos.js';
import {Conversations} from '../api/conversation.js';
import TextMessage from './Conversation/TextMessage.jsx';
import TextInputMessage from './Conversation/TextInputMessage.jsx';
import PhotoMessage from './Conversation/PhotoMessage.jsx';
import PlaceMessage from './Conversation/PlaceMessage.jsx';
import TimelineStrip from './TimelineStrip.jsx';
import Controls from './Controls.jsx';

const DELAY_TIME = 1000;

function splitParameters(state) {
  console.log(state);
  var split_state = state.split("?");

  if (split_state.length > 1) {
    console.log(split_state);
    var parameters = {};
    var split_parameters = split_state[1].split(",");
    for (var i = 0; i < split_parameters.length; i++) {
      var split_parameter = split_parameters[i].split("=");
      parameters[split_parameter[0]] = split_parameter[1];
    }
  } else {
    var parameters = [];
  }

  return {state: split_state[0], parameters: parameters};
}

export class ClusterConversation extends Component {
    constructor(props) {
        super(props);

        this.state = {
          pending: false,
          currentImage: undefined,
        };
    }

    finishTransition(update) {
      // if there is an automatic state transition and we're not currently waiting for a state transition (to avoid infinite loops)
      var transition = function() {
        Meteor.call('conversation.addHistory', this.props.cluster._id, update.output, update.newState);
      }.bind(this, update);

      // add a 1.5 second delay to make it seem more natural
      setTimeout(transition, DELAY_TIME);
      this.setState({pending: true});
    }

    componentWillReceiveProps(newProps) {
      // when new a new chat state is arriving, disable pending indicator
      if (typeof this.props.conversation == 'undefined') {
        var old_length = 0;
      } else {
        var old_length = this.props.conversation.history.length;
      }

      if (newProps.conversation.history.length != old_length) {
        if (newProps.conversation.history.length > 0) {
          if (newProps.conversation.history[newProps.conversation.history.length-1].from.slice(0,3) == 'app') {
            this.setState({pending: false});
          }
        }
      }
      
    }

    componentDidUpdate() {
      console.log("componentDidUpdate");
      if (this.state.pending === false) {
        console.log("autoSubmitting");
        this.autoTransition(this.finishTransition.bind(this));
      }
    }

    // some states should automatically transition into another one
    autoTransition(transitionCallback) {
      if (typeof this.props.conversation !== 'undefined') {
        var split_state = splitParameters(this.props.conversation.state);

        switch(split_state.state) {
          case 'uninitialized':
            var corrected_time = moment(this.props.cluster.start_time.utc_timestamp).utcOffset(this.props.cluster.start_time.tz_offset/60);
            var content = "Hi! Let's talk about the day you spent in " + this.props.cluster.location + " on " + corrected_time.format('MMMM Do YYYY') + ".";
            transitionCallback({output: {from: 'app', content: content}, newState: 'unrecognized_person'});
            break;

          case 'unrecognized_person':
            if (this.props.cluster.faces.length > 0) {
              var newState = 'person_in_photo';
              var content = "I see some people I don't recognize.";
            } else {
              var newState = 'no_comment';
              var content = "I don't have anything to ask you right now."
            }

            transitionCallback({output: {from: 'app', content: content}, newState: newState});
            break;

          case 'person_in_photo':
            // select first image with a person
            for (var i = 0; i < this.props.photos.length; i++) {
              if (this.props.photos[i].openfaces.length > 0) {
                break;
              }
            }

            var photo_id = this.props.photos[i]._id._str;
            console.log(photo_id);

            transitionCallback({output: {from: 'app_image', content: photo_id}, newState: 'presenting_image?image=' + photo_id + '?face=0'});
            break;

          case 'presenting_image':
            if (!('image' in split_state.parameters)) {
              console.log("ERROR, parameter image should exist here");
            }

            transitionCallback({output: {from: 'app', content: 'Who is this?'}, newState: 'determining_name?image=' + split_state.parameters.image});
            break;

          default:
            break;
        }
      }
    }

    // some transitions are triggered by input
    stateTransition(text, transitionCallback) {
      var split_state = splitParameters(this.props.conversation.state);

      switch(split_state.state) {
        case 'determining_name':
          var interpretPerson = function interpretPerson(err, names) {
            if (err) {
              alert(err);
            } else {
              if (names.length == 0) {
                var content =  "Sorry, I'm not sure I got that. Is there a person in this image?";
                var newState = 'are_there_people?image=' + split_state.parameters.image;

              } else if (names.length == 1) {
                if (Math.random() > 0.5) {
                  var content = "Just double checking, that's " + names[0] + "?";
                } else {
                  var content = "Oh, so that's " + names[0] + "?";
                }

                var newState = 'confirming_person?image=' + split_state.parameters.image + ',name=' + names[0];
              } else if (names.length > 1) {
                var listed_names = names.reduce(function(list, n, i, a) {
                  if (i == a.length - 1) {
                    return list + " or " + n
                  } else {
                    return list + ", " + n
                  }
                });
                var content = "Wait, is that " + listed_names + "?";
                var newState = 'determining_name?image=' + split_state.parameters.image;
              }

              transitionCallback({output: {from: 'app', content: content}, newState: newState})
          }}.bind(transitionCallback);

          Meteor.call('conversation.whoIs', text, interpretPerson);

          break;

        case 'confirming_person':
          var confirmName = function confirmName(err, yn) {
            if (err) {
              alert(err);
            } else {

              if (yn) {
                // add name to names database

                // Meteor.call('conversation.associateFace', split_state.parameters.name, split_state.parameters.image, split_state.parameters.face)

                content = 'Ok, great! What were you doing with ' + split_state.parameters.name + ' on that day?';
                newState = 'gathering_clustering_information?name=' + split_state.parameters.name;

              } else {

                // could not confirm name
                content = 'Oh, so who is it?';
                newState = 'determining_name';
              }

              transitionCallback({output: {from: 'app', content: content}, newState: newState});

            }
          }.bind(transitionCallback);

          Meteor.call('conversation.confirm', text, confirmName);
          break;

        case 'are_there_people':
          console.log('are_there_people');
          break;

        case 'gathering_clustering_information':
          console.log('gathering_clustering_information');
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
        Meteor.call('conversation.addHistory', this.props.cluster._id, {from: 'user', content: text}, this.props.conversation.state);
        this.setState({pending: true});

        this.stateTransition(text, this.finishTransition.bind(this));
      }
    }

  render() {
    if (typeof this.props.conversation !== 'undefined') {

      var split_state = this.props.conversation.state.split("?");
      if (split_state.length > 0) {
        var parameter = split_state[1];
        var state = split_state[0];
      } else {
        var parameter = '';
        var state = this.props.conversation.state;
      }

      var conversation = [];
      var app_side = true;
      var user_side = true;

      for (var i = this.props.conversation.history.length; i >= 0; i--) {
        if (i == this.props.conversation.history.length) {
          if (this.state.pending) {
            conversation = [<TextMessage idTag="computer-side" content="..." />, <div className="computer-avatar"><img src="/icons/Computer-100.png" /></div>];
            app_side = false;
          } else {
            conversation = [<TextInputMessage ref="textInput" onSubmit={this.handleSubmit.bind(this)} />, <div className="user-avatar"><img src="/icons/user.png" /></div>];
            user_side = false;
          }
        } else {
          var m = this.props.conversation.history[i];

          if (m.from == 'app') {
            var new_items = [<TextMessage idTag="computer-side" content={m.content} />];
            if (app_side) {
              new_items.push(<div className="computer-avatar"><img src="/icons/Computer-100.png" /></div>);
            }
            app_side = false;
            conversation = new_items.concat(conversation);

          } else if (m.from == 'app_image') {
            var selectedPhoto = this.props.photos.filter(function(p) {
              return p._id._str == m.content;
            })[0];

            var new_items = [<PhotoMessage idTag="computer-side" content={selectedPhoto} />];
            if (app_side) {
              new_items.push(<div className="computer-avatar"><img src="/icons/Computer-100.png" /></div>);
            }
            app_side = false;
            conversation = new_items.concat(conversation);

          } else {
            var new_items = [<TextMessage idTag="human-side" content={m.content} />];

            if (user_side) {
              new_items.push(<div className="user-avatar"><img src="/icons/user.png" /></div>);
            }
            user_side = false;
            conversation = new_items.concat(conversation);
          }
        }
      }

      


      return (
          <div className="cluster-conversation-wrapper">
            <Controls debug={true} cluster={this.props.cluster} />

            <div className="cluster-conversation-lower">
              <div className="cluster-conversation-left">
                <div className="cluster-conversation">
                  {conversation}
                </div>
              </div>

              <div className="cluster-conversation-right">
                <TimelineStrip photos={this.props.photos} /> {/* <TimelineStrip photos={this.props.photos} callback={this.selectPhoto} scrollPosition={} /> */}
              </div>
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

