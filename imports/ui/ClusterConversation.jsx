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
import {StateMachine, splitParameters, combineParameters} from './Conversation/StateMachine.js';

const DELAY_TIME = 100;

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
      if (FlowRouter.subsReady()) {
        // some states are automatically transitioned into other ones
        if (this.state.pending === false) {
          var split_state = splitParameters(this.props.conversation.state);

          if ('autoTransition' in StateMachine[split_state.state]) {
            StateMachine[split_state.state].autoTransition(this.finishTransition.bind(this), this.props, split_state.parameters);
          }
        }

        this.refs.conversation.scrollTop = this.refs.conversation.scrollHeight;
      } 
    } 

    // some transitions are triggered by input
    stateTransition(text, transitionCallback) {
      var split_state = splitParameters(this.props.conversation.state);

      StateMachine[split_state.state].stateTransition(transitionCallback, text, this.props, split_state.parameters);
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
    console.log(this.props);
    if (typeof this.props.conversation !== 'undefined') {


      // build up the conversation DOM elements
      // this should be moved to a seperate component at some point
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
              <Controls debug={true} cluster={this.props.cluster} key={this.props.cluster._id._str + "_controls"} state={split_state.state}/>
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
      return <div className="cluster-conversation-wrapper">
        <div className="cluster-conversation-header">
          <h1>Loading...</h1>
        </div>
      </div>
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

