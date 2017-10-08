import { chooseRandomResponse, makeList, makeAndList, reversePronouns, definiteArticles, listOfItems } from '../../api/nlp_helper.js';

export var StateMachine = {};

var nlp7 = require('compromise');

// HELPER FUNCTIONS

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
  	if ((k != 'input') && (k != "")) {
    	combined_params += k + '=' + params[k] + ',';
    }
  }

  return combined_params;
}

export { combineParameters };
export { splitParameters };

function getLastQuestion(history) {
	var question = '';

	for (var i = history.length - 1; i >= 0; i--) {
		if (history[i].from === 'app') {
			question = history[i].content;
			break;
		}
	}

	return question;
}

function byDate(a,b) {
	return (a.datetime.utc_timestamp - b.datetime.utc_timestamp);
}

function getDateOfPlace(place, photos) {
	console.log(photos);
	console.log('getDateOfPlace');

	var images_in_place = photos.filter(function(p) {
		if ('place' in p) {
	        return p.place.place_id._str === place._id._str;
	    } else {
	    	return false;
	    }
	});

	images_in_place = images_in_place.sort(byDate);

	if (images_in_place.length > 0) {
		return images_in_place[0].datetime;
	} else {
		return photos[0].datetime;
	}
}

function sortPlaces(a, b) {
	date_a = getDateOfPlace(a, this);
	date_b = getDateOfPlace(b, this);
	return (date_a.utc_timestamp - date_b.utc_timestamp);
}

// new conversations always start in the uninitialized state
StateMachine['uninitialized'] = {
	autoTransition: function uninitializedAutoTransition(transitionCallback, props, parameters) {
		// TODO: make this intro dialog more responsive/interesting!
		
		var start_time = moment(props.cluster.start_time.utc_timestamp).utcOffset(props.cluster.start_time.tz_offset/60);
		var end_time = moment(props.cluster.end_time.utc_timestamp).utcOffset(props.cluster.end_time.tz_offset/60);

		var duration = moment.duration(end_time - start_time);

		if ((end_time.date() != start_time.date()) && (end_time.hour() >= 4)) {
			// this event spans multiple days
			if ((start_time.weekday() == 5 || start_time.weekday() == 6) && duration.asDays() < 3) {
				var intro = 'your weekend';
			} else if (duration.asDays() > 5) {
				var intro = 'your week';
			} else {
				var intro = 'your experience';
			}

		} else {
			var intro = 'the day you spent';
		}

        var content = "Hi! Let's talk about " + intro + " in " + props.cluster.location + ".";
       	var intro = "By asking questions about your photos, we'll start building a story together.";

        transitionCallback({output: {from: 'app', content: content + ' ' + intro}, newState: 'timebox'});
	}
};

StateMachine['timebox'] = {
	autoTransition: function timeboxAutoTransition(transitionCallback, props, parameters) {
		var content = "This could take about a half hour, so make yourself comfortable! Everything is saved if you want to stop or take a break. If you ever want to skip a question, just click on a photo in the timeline on the right to redirect the conversation.";

		transitionCallback({output: {from: 'app', content: content}, newState: 'audience'});
	}
}

StateMachine['audience'] = {
	autoTransition: function audienceAutoTransition(transitionCallback, props, parameters) {
		var content = "Before we get too far, it's good to think about who you want to write the story for -- a group of friends, a family member, or maybe just a journal for yourself. Who do you want to share these photos with?";

		transitionCallback({output: {from: 'app', content: content}, newState: 'waiting_for_audience'});
	}
}

StateMachine['waiting_for_audience'] = {
	stateTransition: function audienceTransition(transitionCallback, text, props, parameters) {
		// future: maybe store the intended audience here to suggest output formats

		var content = chooseRandomResponse(["Ok, great.", "Good idea."]);
		transitionCallback({output: {from: 'app', content: content}, newState: 'grand_central?person_count=0,place_count=0'})
	}
}

// This state is kind o the master state -- returning here will provide a new task of some kind
StateMachine['grand_central'] = {
	autoTransition: function grandCentral(transitionCallback, props, parameters) {
		// create list of people, and what image they are in
		Meteor.call('conversation.getUnrecognizedPeople', props.photos, grandCentral);
		parameters.person_count = parseInt(parameters.person_count);
		parameters.place_count = parseInt(parameters.place_count);
		
		function grandCentral(err, response) {
			if (err) {
				alert(err);
				return;
			}

			var unrecognized_people = response.unrecognized;
			var recognized_people = response.recognized;
			console.log(unrecognized_people);
			console.log(recognized_people);
			console.log('grand central');

			var places = props.places.sort(sortPlaces.bind(props.photos));

			var unnamed_places = places.filter(function(p) {
				var photos_in_place = props.photos.filter(function(photo) {
					if ('place' in photo) {
						return photo.place.place_id._str === p._id._str;
					} else {
						return false;
					}
				});

				if (photos_in_place.length > 2) {
					return !('name' in p);
				} else {
					return false;
				}
			});

			var named_places = places.filter(function(p) {
				var photos_in_place = props.photos.filter(function(photo) {
					if ('place' in photo) {
						return photo.place.place_id._str === p._id._str;
					} else {
						return false;
					}
				});

				if (photos_in_place.length > 2) {
					return ('name' in p);
				} else {
					return false;
				}
			});

			// if ((unrecognized_people.length > 0) && (parameters.person_count < 3)) {
			// 	// unidentified person (MAX 3)
				
			// 	parameters.image = unrecognized_people[0].image;
			// 	parameters.face = unrecognized_people[0].face;

			// 	if ('name' in unrecognized_people[0]) {
			// 		parameters.firstName = unrecognized_people[0].name.firstName;
			// 		parameters.lastName = unrecognized_people[0].name.lastName;
			// 		parameters.gender = unrecognized_people[0].name.gender;
			// 	}

			// 	if (parameters.person_count === 0) {
			// 		var content = "Let's start by helping me identify some people you were with.";
			// 	} else {
			// 		var content = "There's " + ((unrecognized_people.length === 1) ? 'another person' : 'a few more people') + " I need some help with.";
			// 	}

			// 	parameters.person_count++;

			// 	var newState = 'person_in_photo?' + combineParameters(parameters);

			if ((unnamed_places.length > 0) && (parameters.place_count < 3)) {
				// unidentified place (MAX 3)

				parameters.place = unnamed_places[0]._id._str;

				if (parameters.place_count > 0) {
					var content = "There's a few more places I don't know.";
				} else {
					var content = "I'm going to ask about some of the places that you stopped to take photos.";
				}

				parameters.place_count++;

				var newState = 'place_in_cluster?' + combineParameters(parameters);

			} else {
				if (named_places.length > 0) {
					// TODO fix this: should only trigger if first named place is near the beginning of the cluster
					var content = "The photos that start this experience were taken at " + reversePronouns(named_places[0].name) + ". Did you do anything else before you went here?";
					var newState = "evaluate_before?place_id=" + named_places[0]._id + ",place_name=" + named_places[0].name;
				} else {
					// get a word for the current time of day
					var start_time = moment(props.cluster.start_time.utc_timestamp).utcOffset(props.cluster.start_time.tz_offset/60);

					if (start_time.hour() < 12) {
						var timeOfDay = "morning";
					} else if (start_time.hour() < 17) {
						var timeOfDay = "afternoon";
					} else {
						var timeOfDay = "evening";
					}

					var content = "What were you doing this " + timeOfDay + "?";
					var newState = "setting_setup";
				}
			}

			transitionCallback({output: {from: 'app', content: content}, newState: newState});
		}
	}
};

// STATES FOR DETERMINING THE NAME OF PEOPLE IN PHOTOS

StateMachine['person_in_photo'] = {
	autoTransition: function personInPhotoAutoTransition(transitionCallback, props, parameters) {
		transitionCallback({output: {from: 'app_image', content: parameters.image}, newState: 'presenting_image?' + combineParameters(parameters)});
	}
};

StateMachine['presenting_image'] = {
	autoTransition: function presentingImageAutoTransition(transitionCallback, props, parameters) {
		// TODO: this should try to identify the person based on face representation first
		var image = props.photos.filter(function(p) {
        	return p._id._str == parameters.image
        }, parameters)[0];

		var faceCenter = image.openfaces[parameters.face].rect[0] + image.openfaces[parameters.face].rect[2]/2;
        var width = 1280;

        if ('firstName' in parameters) {
        	if (faceCenter <= width/3) {
	        	var output = 'I think that ' + parameters.firstName + ' is on the left of this picture, is that right?';
	        } else if (faceCenter >= 2*width/3) {
	        	var output = 'I think that ' + parameters.firstName + ' is on the right here, is that correct?';
	        } else {
	        	var output = 'It looks like ' + parameters.firstName + ' is in the middle of this photo, am I right?';
	        }

	        parameters.highlighted = parameters.image;
	        var nextState = 'confirming_person?' + combineParameters(parameters);

	    } else {
	        if (faceCenter <= width/3) {
	        	var output = 'Who is that, on the left?';
	        } else if (faceCenter >= 2*width/3) {
	        	var output = 'Who is on the right?';
	        } else {
	        	var output = 'Who is in the middle of this picture?'
	        }

	        parameters.highlighted = parameters.image;
	        var nextState = 'determining_name?' + combineParameters(parameters);
        }

        transitionCallback({output: {from: 'app', content: output}, newState: nextState});
	}
};


StateMachine['determining_name'] = {
	stateTransition: function determiningNameTransition(transitionCallback, text, props, parameters) {
		var interpretPerson = function interpretPerson(err, names) {
        if (err) {
          alert(err);
        } else {
          if (names.length == 0) {
            var content =  "Sorry, I'm not sure I got that. Is there a person in this image?";
            var newState = 'are_there_people?' + combineParameters(parameters);

          } else if (names.length == 1) {
            if (Math.random() > 0.5) {
              var content = "Just double checking, that's " + names[0].firstName + "?";
            } else {
              var content = "Oh, so that's " + names[0].firstName + "?";
            }

            parameters.firstName = names[0].firstName;
            parameters.lastName = names[0].lastName;
            parameters.gender = names[0].gender;

            var newState = 'confirming_person?' + combineParameters(parameters);
          } else if (names.length > 1) {
            var listed_names = names.reduce(function(list, n, i, a) {
              if (i == a.length - 1) {
                return list + " or " + n.firstName;
              } else {
                return list + ", " + n.firstName;
              }
            });
            var content = "Wait, is that " + listed_names + "?";
            var newState = 'determining_name?' + combineParameters(parameters);
          }

          transitionCallback({output: {from: 'app', content: content}, newState: newState})
      }}.bind(transitionCallback);

      Meteor.call('conversation.NER', text, interpretPerson);
  }
}

StateMachine['confirming_person'] = {
	stateTransition: function confirmingPersonTransition(transitionCallback, text, props, parameters) {
		var confirmName = function confirmName(err, yn) {
		if (err) {
			alert(err);
		} else {

			if (yn) {
				// add name to names database

				Meteor.call('conversation.associateFace', {firstName: parameters.firstName, lastName: parameters.lastName, gender: parameters.gender}, parameters.image, parameters.face, props.cluster._id._str);

				content = 'Ok, great!';

				// clear parameters and return to grand central
				delete parameters.firstName;
				delete parameters.lastName;
				delete parameters.gender;
				// delete parameters.image;
				delete parameters.face;
				delete parameters.highlighted;
				newState = 'what_next_photo?' + combineParameters(parameters);
			} else {

				// could not confirm name
				content = 'Oh, so who is it?';
				newState = 'determining_name?' + combineParameters(parameters);
			}

			transitionCallback({output: {from: 'app', content: content}, newState: newState});

		}
		}.bind(transitionCallback);

        Meteor.call('conversation.confirm', text, confirmName);
	}
}

StateMachine['are_there_people'] = {
	stateTransition: function areTherePeopleTransition(transitionCallback, text, props, parameters) {
		var isPerson = function isPerson(err, yn) {
			if (err) {
				alert(err);
			} else {
				if (yn) {
					content = 'Okay, so who is it?';
					newState = 'determining_name?' + combineParameters(parameters);
				} else {
					content = 'Oh, sorry about that.';
					Meteor.call('conversation.associateFace', {firstName: ""}, parameters.image, parameters.face, props.cluster._id._str);

					delete parameters.firstName;
					delete parameters.lastName;
					delete parameters.gender;
					// delete parameters.image;
					delete parameters.face;
					delete parameters.highlighted;
					newState = 'what_next_photo?' + combineParameters(parameters);

				}

				transitionCallback({output: {from: 'app', content: content}, newState: newState});
			}
		}.bind(transitionCallback);
		Meteor.call('conversation.confirm', text, isPerson);
	}
}

// STATES FOR DETEMRINING NAME OF PLACES IN CLUSTER

StateMachine['place_in_cluster'] = {
	autoTransition: function placeInClusterAutoTransition(transitionCallback, props, parameters) {
		var images_in_place = props.photos.filter(function(p) {
        	if ('place' in p) {
                return p.place.place_id._str === parameters.place;
            } else {
            	return false;
            }
        }, parameters);

        var highlight_list = images_in_place.reduce(function(a, b) {
          return a + ';' + b._id._str;
        }, '');

        highlight_list = highlight_list.slice(1, highlight_list.length);

        var place = props.places.filter(function(p) {
        	return p._id._str === parameters.place;
        })[0];

        parameters.highlighted = highlight_list;
        var nextState = 'presenting_place?' + combineParameters(parameters);
        transitionCallback({output: {from: 'app_place', content: {center: place.location.coordinates, size: place.radius}}, newState: nextState});
  	}	
};

StateMachine['presenting_place'] = {
	autoTransition: function presentingPlaceAutoTransition(transitionCallback, props, parameters) {
		var response = chooseRandomResponse(["Where did you take these photos?", "What is the name of this place?", "Where is this?", "What do you call this area?"]);
    	transitionCallback({output: {from: 'app', content: response}, newState: 'determining_place?' + combineParameters(parameters)});
	}
};

StateMachine['determining_place'] = {
	stateTransition: function determiningPlaceTransition(transitionCallback, text, props, parameters) {

		function findLongestPhrase(err, nouns) {
			if (err) {
				alert(err);
			} else {
				var sorted_nouns = nouns.sort(function(a,b) {
					return a.length < b.length;
				});

				var name = sorted_nouns[0];

				if (name) {
					// update the place database with the name
					Meteor.call('conversation.namePlace', name, this.place);

					// the place might have pronouns in it, (e.g. "our hotel") so we should reverse those before generating display output
					var displayName = reversePronouns(name);

					var response = chooseRandomResponse(["Ok, I'll mark those as taken at " + displayName + ".", "Great, now I know that photos there are at "+ displayName + ".", "Got it, those are from " + displayName + "."]);

					delete parameters.place;
					delete parameters.highlighted;
					transitionCallback({output: {from: 'app', content: response}, newState: 'grand_central?' + combineParameters(parameters)});
				} else {
					Meteor.call('conversation.removePlace', this.place);

					var response = "I'll remove this place from your map.";

					delete parameters.place;
					delete parameters.highlighted;
					transitionCallback({output: {from: 'app', content: response}, newState: 'grand_central?' + combineParameters(parameters)});
				}
			}
		}

		Meteor.call('conversation.nounPhrases', text, findLongestPhrase.bind(parameters));
	}
};

// STATES FOR IDENTIFYING INTERESTING PHOTOS

StateMachine['most_interesting_setup'] = {
	autoTransition: function mostInterestingAutoTransition(transitionCallback, props, parameters) {
        transitionCallback({output: {from: 'app', content: "Which image from this experience do you find most interesting? You can select from the photos displayed on the right."}, newState: 'get_interesting_photo?input=photo'});
	}
};

StateMachine['get_interesting_photo'] = {
	stateTransition: function getInterestingPhotoTransition(transitionCallback, text, props, parameters) {
		Meteor.call('conversation.rateImage', text, 3);

		transitionCallback({output: {from: 'app', content: "That's a good one. Can you tell me about the photo? What do you like about it?"}, newState: 'gathering_image_information?image=' + text});
	}
};

// STATE FOR GATAHERING BEGINNING OF THE CLUSTER INFORMATION

StateMachine['evaluate_before'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('evaluate_before');
		var question = getLastQuestion(props.conversation.history);

		function handleEvaluateBefore(err, response) {
			if (err) {
				alert(err);
			} else {
				if (response == 'yes') {
					nextState = 'ask_before';
					output = 'Cool, what did you do?';
				} else if (response == 'no') {
					nextState = 'setting_setup?' + combineParameters(parameters);
					output = 'Okay, what were you doing at ' + reversePronouns(parameters.place_name) + "?";
				} else {
					console.log(props);
					Meteor.call('conversation.addNarrativeToCluster', props.cluster._id._str, {question: question, answer: text});
					nextState = 'what_next';
					output = 'Cool, what did you do next?';
				}

				console.log(nextState);
				console.log(output);
				transitionCallback({output: {from: 'app', content: output}, newState: nextState + "?" + combineParameters(parameters)});
			}
		}

		Meteor.call('conversation.yesNoDescription', text, handleEvaluateBefore);
	}
}

StateMachine['setting_setup'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('setting_setup');

		var question = getLastQuestion(props.conversation.history);
		Meteor.call('conversation.addNarrativeToCluster', props.cluster._id._str, {question: question, answer: text});

		transitionCallback({output: {from: 'app', content: 'What photo shows the beginning of this experience?'}, newState: 'what_next_photo?input=photo,role=setting,' + combineParameters(parameters)});
	}
}

StateMachine['ask_before'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('ask_before');

		var question = getLastQuestion(props.conversation.history);
		Meteor.call('conversation.addNarrativeToCluster', props.cluster._id._str, {'question': question, 'answer': text});

		var count = ('count' in parameters) ? parseInt(parameters.count) : 0;

		if (count == 0) {
			function followUp(err, response) {
				if (err) {
					alert(err);
				} else {
					if ('count' in this) {
						this.count++;
					} else {
						this.count = 1;
					}

					console.log(this);
					console.log(combineParameters(this));
					transitionCallback({output: {from: 'app', content: response}, newState: "ask_before?" + combineParameters(this)});
				}
			}

			if (Math.random() < 0.5) {
				Meteor.call('conversation.tellMeMore', text, followUp.bind(parameters));
			} else {
				Meteor.call('conversation.askWhy', text, followUp.bind(parameters));
			}
		} else {
			var start_time = moment(props.cluster.start_time.utc_timestamp).utcOffset(props.cluster.start_time.tz_offset/60);

			if (start_time.hour() < 12) {
				var timeOfDay = "morning";
			} else if (start_time.hour() < 17) {
				var timeOfDay = "afternoon";
			} else {
				var timeOfDay = "evening";
			}

			var response = chooseRandomResponse(["What were your goals for the " + timeOfDay + "?", "What did you want to do later?", "What were your plans for the " + timeOfDay + "?"]);
			var newState = "goals?" + combineParameters(parameters);

			transitionCallback({output: {from: 'app', content: response}, newState: newState});
		}
	}
};

StateMachine['goals'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		var question = getLastQuestion(props.conversation.history);
		Meteor.call('conversation.addNarrativeToCluster', props.cluster._id._str, {'question': question, 'answer': text});
		var computerReply = chooseRandomResponse(["Cool, what did you do next?", "Righteous, what did you do afterwards?"])
		transitionCallback({output: {from: 'app', content: computerReply}, newState: 'what_next?' + combineParameters(parameters)});
	}
};

StateMachine['what_next'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		var question = getLastQuestion(props.conversation.history);
		var computerReply = chooseRandomResponse(["I'd love to see a photo of that. Can you show me one?", "What photo best shows that moment?", "I want to see a picture!"]);
		// send question and answer as parameters, because the last response should be associated with an image, and not with the cluster.
		// hack hack hack
		var encodedQuestion = question.replace(',', 'CoMmA').replace('?', 'QuEsTiOn');
		var encodedAnswer = text.replace(',', 'CoMmA').replace('?', 'QuEsTiOn');
		transitionCallback({output: {from: 'app', content: computerReply}, newState: 'what_next_photo?input=photo,lastAnswer=' + encodedAnswer + ',lastQuestion=' + encodedQuestion + ',' + combineParameters(parameters)});
	} 
};

StateMachine['what_next_photo'] = {
	// if we already have an image provided to us, there's no need to wait for the user -- we can generate a question straightaway
	autoTransition: function(transitionCallback, props, parameters) {
		if ('image' in parameters) {
			StateMachine['what_next_photo']['stateTransition'](transitionCallback, parameters.image, props, parameters);
		}
	},

	stateTransition: function(transitionCallback, text, props, parameters) {
		parameters['image'] = text;

		var image = props.photos.filter(function(p) {
        	return p._id._str == parameters.image
        }, parameters)[0];

		if ('lastAnswer' in parameters) {
			var decodedQuestion = parameters.lastQuestion.replace('CoMmA', ',').replace('QuEsTiOn', '?');
			var decodedAnswer = parameters.lastAnswer.replace('CoMmA', ',').replace('QuEsTiOn', '?');
			Meteor.call('conversation.addNarrativeToImage', parameters.image, {question: decodedQuestion, answer: decodedAnswer});
			delete parameters.lastQuestion;
			delete parameters.lastAnswer;
		}

		if ('role' in parameters) {
			console.log('adding role');
			Meteor.call('conversation.giveImageRole', parameters.image, parameters.role);
			delete parameters.role;
		}

		Meteor.call('conversation.rateImage', parameters.image, 3);

		console.log('what_next_photo');

		Meteor.call('conversation.getUnrecognizedPeople', [image], function(err, people) {
			console.log(people);

			if (people.unrecognized.length > 0) {
				// there are people I don't recognize
				if (people.recognized.length > 0) {
					var people_string = listOfItems(people.recognized.map(function(p) {
						return p.name.firstName;
					}));

					var response = "There's someone that I don't recognize with " + people_string + ".";
				} else {
					var response = "Hmm, I see some new faces here.";
				}

				parameters['face'] = people.unrecognized[0].face;
				var newState = 'presenting_image?' + combineParameters(parameters);

			} else if (people.recognized.length > 0) {
				var newState = 'follow_up_image?' + combineParameters(parameters);

				var people_string = listOfItems(people.recognized.map(function(p) {
						return p.name.firstName;
					}));

				var response = chooseRandomResponse(
					["What do you like about this photo of " + people_string + "?",
					"Why did you decide to take a picture of " + people_string + " here?",
					"How long have you known " + people_string + "?",
					"How well do you know " + people_string + "?",
					"If you were to find this photo in a couple years, what would you want to " + chooseRandomResponse(["remember", "tell yourself", "explain", "forget", "feel"]) + "?"],
					"In a year, do you think this photo will matter more to you than it does now?",
					"What were you feeling just before you took this photo?",
					"What were you all doing?!");
			} else {
				var newState = 'follow_up_image?' + combineParameters(parameters);

				var response = chooseRandomResponse(
					["What do you like about this photo?", 
					"What were you doing?",
					"Perfect. What inspired you to take this shot?",
					"Huh. I'm not sure what to say. Do you like this picture?",
					"Terriffic... but was there something else that you didn't get to take a picture of?",
					"How did you feel after you took this picture?",
					"What was behind you?",
					"Did you take this picture for anyone in particular?",
					"If you were to find this picture in a year, what would you want to remember from it?",
					"Did you feel comfortable here?"]);
			}

			transitionCallback({output: {from: 'app', content: response}, newState: newState});
			
		});

		// long term todo -- use image understanding to ask better questions
		// TODO: actually incorporate tweetbot question generator questions (w/ Tracery)
	}
}

// STATE FOR GATHERING GENERIC IMAGE INFORMATION

StateMachine['follow_up_image'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('follow up image');
		console.log(parameters.image);
		var question = getLastQuestion(props.conversation.history);
		Meteor.call('conversation.addNarrativeToImage', parameters.image, {question: question, answer: text});

		function imageFollowUp(err, response) {
			if (err) {
				alert(err);
			} else {
				var newState = 'forward?' + combineParameters(parameters);

				if (response === false) {
					var output = "Tell me more about that.";
				} else {
					var output = response;
				}

				transitionCallback({output: {from: 'app', content: output}, newState: newState});
			}
		}

		Meteor.call('conversation.tellMeMore', text, imageFollowUp.bind(parameters));
	}
}

StateMachine['forward'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('forward');

		var question = getLastQuestion(props.conversation.history);
		Meteor.call('conversation.addNarrativeToImage', parameters.image, {question: question, answer: text});

		// if last image discussed is near end of event
		var image_index = props.photos.map(p => p._id._str).indexOf(parameters.image);
		var images_to_end = props.photos.length - 1 - image_index;

		console.log(props);
		console.log(image_index);
		console.log(props.photos.length);
		console.log(images_to_end);

		if (!('num_forward' in parameters)) {
			parameters.num_forward = 0;
		}

		console.log('num_forward');
		console.log(parameters.num_forward);

		// time for a new photo, erase anything that's still hanging on here
		delete parameters.image;

		if ((images_to_end < 4) || (parameters.num_forward > 7)) {
			var output = 'What photo best shows the conclusion to this experience?';
			var nextState = 'conclusion_photo?input=photo,' + combineParameters(parameters);
		} else {
			parameters.num_forward += 1;
			var choice = Math.random()*3;

			if (choice < 1) {
				// rand 1

				var possible_words = ["is interesting", "tells a story", "is beautiful", "is dissapointing"];
				var word = possible_words[Math.floor(Math.random()*possible_words.length)];

				var output = "Show me another photo, one you think " + word + ".";
				var nextState = 'what_next_photo?input=photo,' + combineParameters(parameters);
			} else if (choice < 2) {
				// rand 2

				var new_place = -1;
				console.log(parameters);
				if ('place_id' in parameters) {
					var named_places = props.places.filter(function(p) {
						return ('name' in p);
					});

					// TODO
					// Okay, move onto a place here and if it has no name that's okay! 

					console.log('forward NAMED PLACES');
					console.log(named_places);

					var place_index = named_places.sort(sortPlaces.bind(props.photos)).map(p => p._id._str).indexOf(parameters.place_id);

					if (place_index < named_places.length - 1) {
						new_place = named_places[place_index+1];
					}
				}

				console.log(new_place);

				if (new_place != -1) {
					var output = "Next, you went to " + reversePronouns(new_place.name) + ". Is this the first time you had been there?";
					parameters.place_id = new_place._id._str;
					parameters.place_name = new_place.name;

					var images_in_place = props.photos.filter(function(p) {
			        	if ('place' in p) {
			                return p.place.place_id._str === parameters.place_id;
			            } else {
			            	return false;
			            }
			        }, parameters);

			        var highlight_list = images_in_place.reduce(function(a, b) {
			          return a + ';' + b._id._str;
			        }, '');

			        highlight_list = highlight_list.slice(1, highlight_list.length);
			        parameters.highlighted = highlight_list;

					var nextState = 'first_time_place?' + combineParameters(parameters);
				} else {
					var output = "Where did you go next?";
					var nextState = 'what_next_photo?input=photo,' + combineParameters(parameters);
				}
			} else {
				// rand 3

				var peopleIndex = ('peopleIndex' in parameters) ? parseInt(parameters.peopleIndex)+1 : 0;
				parameters.peopleIndex = peopleIndex;

				if (('people' in props.cluster) && (props.cluster.people.length > peopleIndex)) {
					// TODO: highlight images here

					if (Math.random() < 0.5) {
						var output = "You were also with " + props.cluster.people[peopleIndex].name.firstName + ". Do you know this person well?";
						var nextState = "know_well?" + combineParameters(parameters);
					} else {
						parameters.count = 0;
						var output = "It looks like you were with " + props.cluster.people[peopleIndex].name.firstName + ". What brought you together in " + props.cluster.location + "?";
						var nextState = "ask_about_person?" + combineParameters(parameters);;
					}
				} else {
					var output = "Show me another photo you think is interesting."
					var nextState = 'what_next_photo?input=photo,' + combineParameters(parameters);
				}
			}
		}

		transitionCallback({output: {from: 'app', content: output}, newState: nextState});
	}
}

StateMachine['know_well'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('know well');

		function knowWell(err, response) {
			if (err) {
				alert(err);
			} else {
				parameters.count = 0;

				if (response === 'no') {

					parameters.count = 0;
					var output = 'How did you get to know ' + props.cluster.people[parameters.peopleIndex].name.firstName + ' better through this experience?';
					var nextState = 'ask_about_person?' + combineParameters(parameters);
				} else {
					if (response === 'description') {
						var question = getLastQuestion(props.conversation.history);
						Meteor.call('conversation.addNarrativeToCluster', props.cluster._id._str, {question: question, answer: text, person: props.cluster.people[parameters.peopleIndex].person_id});
					}

					parameters.count = 0;
					var output = 'What was it like exploring ' + props.cluster.location + ' with ' + props.cluster.people[parameters.peopleIndex].name.firstName + '?';
					var nextState = 'ask_about_person?' + combineParameters(parameters);
				}

				transitionCallback({output: {from: 'app', content: output}, newState: nextState});
			}
		}

		Meteor.call('conversation.yesNoDescription', text, knowWell);
	}
}

StateMachine['ask_about_person'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		var question = getLastQuestion(props.conversation.history);
		Meteor.call('conversation.addNarrativeToCluster', props.cluster._id._str, {question: question, answer: text, person: props.cluster.people[parameters.peopleIndex].person_id});

		var count = ('count' in parameters) ? parameters.count : 0;

		if (count === 0) {
			function askAboutPerson(err, response) {
				if (err) {
					alert(e);
					return;
				}

				parameters.count++;
				transitionCallback({output: {from: 'app', content: response}, newState: "ask_about_person?" + combineParameters(parameters)});
			}

			if (Math.random() < 0.5) {
				Meteor.call('conversation.tellMeMore', text, askAboutPerson);
			} else {
				Meteor.call('conversation.askWhy', text, askAboutPerson);
			}
		} else {
			var pronoun = 'them';

			console.log(props);

			if ('gender' in props.cluster.people[parameters.peopleIndex]) {
				if (props.cluster.people[parameters.peopleIndex].gender === 'm') {
					var pronoun = 'him';
				} else if (props.cluster.people[parameters.peopleIndex].gender === 'f') {
					var pronoun = 'her';
				}
			}

			transitionCallback({output: {from: 'app', content: "What's your favorite photo of " + pronoun + " from this experience?"}, newState: 'what_next_photo?input=photo,' + combineParameters(parameters)})
		}
	}
}

StateMachine['first_time_place'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('first_time_place');
		var question = getLastQuestion(props.conversation.history);

		function placeFirstTime(err, response) {
			if (err) {
				alert(err);
			} else {
				if (response != 'no') {
					Meteor.call('conversation.addNarrativeToCluster', props.cluster._id._str, {question: question, answer: "This was my first time at " + parameters.place_name, place: parameters.place_id});
					var output = "What part of " + reversePronouns(parameters.place_name) + " did you enjoy the most?";
				} else {
					var output = "What was most different this time?";
				}

				parameters.count = 0;

				nextState = "elaborate_place?" + combineParameters(parameters);
				transitionCallback({output: {from: 'app', content: output}, newState: nextState});
			}
		}

		Meteor.call('conversation.yesNoDescription', text, placeFirstTime);
	}
}

StateMachine['elaborate_place'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('elaborate_place');

		var question = getLastQuestion(props.conversation.history);
		Meteor.call('conversation.addNarrativeToCluster', props.cluster._id._str, {question: question, answer: text, place: parameters.place_id});

		var count = ('count' in parameters) ? parseInt(parameters.count) : 0;

		// this is kind of a state within a state, but i'm keeping it like this so that in the future it can be expanded into more open-ended, non-fixed length elaboration
		if (count === 0) {
			function placeFollowUp(err, response) {
				if (err) {
					alert(err);
				} else {
					parameters.count += 1;
					var newState = 'elaborate_place?' + combineParameters(parameters);

					if (response === false) {
						var output = "Tell me more about that.";
					} else {
						var output = response;
					}

					transitionCallback({output: {from: 'app', content: response}, newState: newState});
				}
			}

			if (Math.random() < 0.5) {
				Meteor.call('conversation.tellMeMore', text, placeFollowUp);
			} else {
				Meteor.call('conversation.askWhy', text, placeFollowUp);
			}
		} else {
			delete parameters.highlighted;

			var output = "What was your favorite photo from " + reversePronouns(parameters.place_name) + "?";
			var nextState = "what_next_photo?input=photo," + combineParameters(parameters);
			transitionCallback({output: {from: 'app', content: output}, newState: nextState});
		}
	}
}

StateMachine['conclusion_photo'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('conclusion_photo');

		parameters.image = text;
		Meteor.call('conversation.rateImage', parameters.image, 3);
		Meteor.call('conversation.giveImageRole', parameters.image, 'conclusion');

		var output = 'How did you feel in this moment?';
		var nextState = 'conclusion_photo_followup?' + combineParameters(parameters);
		transitionCallback({output: {from: 'app', content: output}, newState: nextState});
	}
}

StateMachine['conclusion_photo_followup'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		console.log('conclusion_photo_followup');

		var question = getLastQuestion(props.conversation.history);
		Meteor.call('conversation.addNarrativeToImage', parameters.image, {question: question, answer: text});

		var output = 'Did you accomplish your goals?';
		var nextState = 'conclusion_goals?' + combineParameters(parameters);
		transitionCallback({output: {from: 'app', content: output}, newState: nextState});
	}
}

StateMachine['conclusion_goals'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		function conclusionGoals(err, response) {
			if (err) {
				alert(err);
				return;
			}


			if (response === 'no') {
				var output = 'What happened?'
				var nextState = 'conclusion_goal_miss?' + combineParameters(parameters);
			} else {
				var output = "Cool! What will you do next time you're in " + props.cluster.location + "?";
				var nextState = 'conclusion_conclusion?' + combineParameters(parameters);
			}

			transitionCallback({output: {from: 'app', content: output}, newState: nextState});
		}

		Meteor.call('conversation.yesNoDescription', text, conclusionGoals);
	}
}

StateMachine['conclusion_goal_miss'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		var question = getLastQuestion(props.conversation.history);
		Meteor.call('conversation.addNarrativeToImage', parameters.image, {question: question, answer: text});

		var output = 'What will you do next time you are here?';
		var nextState = 'conclusion_conclusion?' + combineParameters(parameters);

		transitionCallback({output: {from: 'app', content: output}, newState: nextState});
	}
}

StateMachine['conclusion_conclusion'] = {
	stateTransition: function(transitionCallback, text, props, parameters) {
		var question = getLastQuestion(props.conversation.history);
		Meteor.call('conversation.addNarrativeToImage', parameters.image, {question: question, answer: text});

		var output = 'Thanks for talking about your experience with me. Now, you can collect your thoughts into a full story by clicking "Start Writing" above.';
		var nextState = '?input=none';

		transitionCallback({output: {from: 'app', content: output}, newState: nextState}); 
	}
}

