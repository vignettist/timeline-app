import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import ReactDOM from 'react-dom';
import {Clusters, LogicalImages, Places} from '../api/photos.js';
import {Conversations} from '../api/conversation.js';
import TextMessage from './Conversation/TextMessage.jsx';
import TextInputMessage from './Conversation/TextInputMessage.jsx';
import PhotoMessage from './Conversation/PhotoMessage.jsx';
import PlaceMessage from './Conversation/PlaceMessage.jsx';
import TimelineStrip from './TimelineStrip.jsx';
import Controls from './Controls.jsx';

const DELAY_TIME = 1000;

function splitParameters(state) {
  var split_state = state.split("?");

  if (split_state.length > 1) {
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

function combineParameters(params) {
  var combined_params = '';

  for (var k in params) {
    combined_params += k + '=' + params[k] + ',';
  }

  return combined_params;
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
      if (this.state.pending === false) {
        this.autoTransition(this.finishTransition.bind(this));
      }

      this.refs.conversation.scrollTop = this.refs.conversation.scrollHeight;
    }

    // some states should automatically transition into another one
    autoTransition(transitionCallback) {
      if (typeof this.props.conversation !== 'undefined') {
        var split_state = splitParameters(this.props.conversation.state);

        switch(split_state.state) {
          case 'uninitialized':
            // TODO: make this intro dialog more responsive/interesting!

            var corrected_time = moment(this.props.cluster.start_time.utc_timestamp).utcOffset(this.props.cluster.start_time.tz_offset/60);
            var content = "Hi! Let's talk about the day you spent in " + this.props.cluster.location + " on " + corrected_time.format('MMMM Do YYYY') + ".";
            transitionCallback({output: {from: 'app', content: content}, newState: 'most_interesting_setup'});
            break;

          case 'most_interesting_setup':
            transitionCallback({output: {from: 'app', content: "Which image from this cluster do you find most interesting? You can select from the photos displayed on the right."}, newState: 'get_interesting_photo?input=photo'});
            break;

          case 'unrecognized_place':
            // TODO: select only unnamed places

            if (this.props.cluster.places.length > 0) {
              var newState = 'place_in_cluster?place=' + this.props.places[0]._id._str;
              var content = 'You took a lot of photos in a place I\'m not familiar with.';
            }

            transitionCallback({output: {from: 'app', content: content}, newState: newState});
            break;

          case 'place_in_cluster':
            var images_in_place = this.props.photos.filter(function(p) {
              if ('place' in p) {
                return p.place.place_id._str === split_state.parameters.place;
              } else {
                return false;
              }
            }, split_state);

            var highlight_list = images_in_place.reduce(function(a, b) {
              return a + ';' + b._id._str;
            }, '');

            highlight_list = highlight_list.slice(1, highlight_list.length);

            transitionCallback({output: {from: 'app_place', content: {center: this.props.places[0].location.coordinates, size: this.props.places[0].radius}}, newState: 'presenting_place?place=' + split_state.parameters.place + ',highlighted=' + highlight_list});
            break;

          case 'unrecognized_person':
            if (this.props.cluster.faces.length > 0) {
              var newState = 'person_in_photo';
              var content = "I see some people I don't recognize.";
            } else {
              if (this.props.cluster.places.length > 0) {
                var newState = 'place_in_cluster?place=' + this.props.places[0]._id._str;
                var content = 'You took a lot of photos in a place I\'m not familiar with.';
              }
            }

            transitionCallback({output: {from: 'app', content: content}, newState: newState});
            break;

          case 'person_in_photo':
            // select first image with a person
            // TODO: select only unnamed people
            for (var i = 0; i < this.props.photos.length; i++) {
              if (this.props.photos[i].openfaces.length > 0) {
                break;
              }
            }

            var photo_id = this.props.photos[i]._id._str;

            transitionCallback({output: {from: 'app_image', content: photo_id}, newState: 'presenting_image?image=' + photo_id + ',face=0'});
            break;

          case 'presenting_image':
            if (!('image' in split_state.parameters)) {
              console.log("ERROR, parameter image should exist here");
            }

            transitionCallback({output: {from: 'app', content: 'Who is this?'}, newState: 'determining_name?image=' + split_state.parameters.image + ',highlighted=' + split_state.parameters.image});
            break;

          case 'presenting_place':
            transitionCallback({output: {from: 'app', content: 'What is the name of this place?'}, newState: 'place_info?' + combineParameters(split_state.parameters)});

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

        case 'get_interesting_photo':
          transitionCallback({output: {from: 'app', content: "That's a good one. Can you tell me about the photo? What do you like about it?"}, newState: 'gathering_clustering_information'});
          break;

        case 'are_there_people':
          var isPerson = function isPerson(err, yn) {
            if (err) {
              alert(err);
            } else {
              if (yn) {
                content = 'Okay, so who is it?';
                newState = 'determining_name';
              } else {
                content = 'Oh, sorry about that.';
                newState = 'unrecognized_place';
              }

              transitionCallback({output: {from: 'app', content: content}, newState: newState});
            }
          }.bind(transitionCallback);

          Meteor.call('conversation.confirm', text, isPerson);
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

    selectPhoto(photo) {
      var split_state = splitParameters(this.props.conversation.state);
      if (split_state.parameters.input == 'photo') {
        Meteor.call('conversation.addHistory', this.props.cluster._id, {from: 'user_image', content: photo}, this.props.conversation.state);
        this.setState({pending: true});
        this.stateTransition(photo, this.finishTransition.bind(this));
      }
    }

  render() {
    if (typeof this.props.conversation !== 'undefined') {

      var split_state = splitParameters(this.props.conversation.state);

      var conversation = [];
      var app_side = true;
      var user_side = true;

      if ('highlighted' in split_state.parameters) {
        var highlighted_list = split_state.parameters.highlighted.split(';');
      } else {
        var highlighted_list = [];
      }

      for (var i = this.props.conversation.history.length; i >= 0; i--) {
        if (i == this.props.conversation.history.length) {
          if (this.state.pending) {
            conversation = [<TextMessage idTag="computer-side" content="..." />, <div className="computer-avatar"><img src="/icons/Computer-100.png" /></div>];
            app_side = false;
          } else {
            if (split_state.parameters.input == 'photo') {
              conversation = [<TextMessage idTag="human-side" content="Select a photo &#8594;" />];
            } else {
              conversation = [<TextInputMessage ref="textInput" onSubmit={this.handleSubmit.bind(this)} />, <div className="user-avatar"><img src="/icons/user.png" /></div>];
              user_side = false;
            }
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

          } else if (m.from == 'app_place') {
            var new_items = [<PlaceMessage idTag="computer-side" content={m.content} cluster={this.props.cluster} photos={this.props.photos}/>];
            if (app_side) {
              new_items.push(<div className="computer-avatar"><img src="/icons/Computer-100.png" /></div>);
            }
            app_side = false;
            conversation = new_items.concat(conversation);

          } else if (m.from == 'user_image') {
            var selectedPhoto = this.props.photos.filter(function(p) {
              return p._id._str == m.content;
            })[0];

            var new_items = [<PhotoMessage idTag="human-side" content={selectedPhoto} />];

            if (user_side) {
              new_items.push(<div className="user-avatar"><img src="/icons/user.png" /></div>);
            }
            user_side = false;
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
            <div className="cluster-conversation-header">
              <Controls debug={true} cluster={this.props.cluster} />
            </div>

            <div className="cluster-conversation-lower">
              <div className="cluster-conversation-left" ref="conversation">
                <div className="cluster-conversation">
                  {conversation}
                  <div className="cluster-spacer">
                  </div>
                </div>
              </div>

              <div className="cluster-conversation-right">
                <TimelineStrip photos={this.props.photos} highlighted={highlighted_list} callback={this.selectPhoto.bind(this)} /> {/* <TimelineStrip photos={this.props.photos} callback={this.selectPhoto} scrollPosition={} /> */}
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
  photos: PropTypes.object.isRequired,
  places: PropTypes.array.isRequired
};

export default createContainer(() => {
  return {
    conversation: Conversations.find({}).fetch()[0],
    cluster: Clusters.find({}).fetch()[0],
    photos: LogicalImages.find({}).fetch(),
    places: Places.find({}).fetch()
  };

}, ClusterConversation);

