// export class ClusterConversationFSM() {
// 	constructor(initial_state, callback) {
// 		this.callback = callback;
// 		this.setState(initial_state);
// 	}

// 	setState(state) {
// 		this.state = state;

// 		this.autoTransition();
// 	}

// 	autoTransition() {
// 	    switch(this.state) {
// 	      case 'init':
// 	        var content = "Hi! Let's talk about the day you spent in " + this.props.cluster.location + " on [PLACEHOLDER DATE].";
// 	        var newState = 'unrecognized_person';
// 	        this.callback(content, newState);
// 	        return({output: {from: 'app', content: content}, newState: 'unrecognized_person'});

// 	      case 'unrecognized_person':
// 	        if (this.props.cluster.faces.length > 0) {
// 	          var newState = 'person_in_photo';
// 	          var content = "I see some people I don't recognize.";
// 	        } else {
// 	          var newState = 'no_comment';
// 	          var content = "I don't have anything to ask you right now."
// 	        }
// 	        this.callback(content, newState);
// 	        return({output: {from: 'app', content: content}, newState: newState});

// 	      case 'person_in_photo':
// 	        return({output: {from: 'app', content: 'Who is this?'}, newState: 'determining_name'});

// 	      default:
// 	        return('none');
// 	    }
//     }

// 	stateTransition(text) {
// 		switch(this.state) {

// 	        case 'determining_name':
// 	          Meteor.call('conversation.whoIs', text, (err, names) => {
// 	            if (err) {
// 	              alert(err);
// 	            } else {
// 	              if (names.length == 0) {
// 	                var content =  "Sorry, I'm not sure I got that. Is there a person in this image?";
// 	                var newState = 'are_there_people';
// 	              } else if (names.length == 1) {
// 	                var content = "Oh, so that's " + names[0] + "?";
// 	                var newState = 'confirming_person';
// 	              } else if (names.length > 1) {
// 	                var listed_names = names.reduce(function(list, n, i, a) {
// 	                  if (i == a.length - 1) {
// 	                    return list + " or " + n
// 	                  } else {
// 	                    return list + ", " + n
// 	                  }
// 	                });
// 	                var content = "Wait, is that " + listed_names + "?";
// 	                var newState = 'determining_name';
// 	              }

// 	              this.state = newState;
// 	              this.callback(content, newState);
// 	            }
// 	          });
// 	          break;

// 	        case 'confirming_person':
// 	          Meteor.call('conversation.confirm', text, (err, yn) => {
// 	            if (err) {
// 	              alert(err);
// 	            } else {
// 	              this.setState({pending: false});
// 	              if (yn) {
// 	              	var content = 'Awesome. Computer out.';
// 	              	var newState = 'no_comment';
// 	              } else {
// 	              	var content = 'Oh, so who is it?';
// 	              	var newState = 'determining_name';
// 	              }

// 	              this.state = newState;
// 	              this.callback(content, newState);
// 	            }
// 	          })
// 	          break;

// 	        case 'are_there_people':
// 	          console.log('are_there_people');
// 	          break;

// 	        case 'determining_name':
// 	          console.log('determining_name');
// 	          break;

// 		}
// 	}
// }