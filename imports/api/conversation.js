import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';
import { People, LogicalImages, Clusters, Places } from './photos.js';
export const Conversations = new Mongo.Collection('conversations');
// People = new Mongo.Collection('people');

var nlp = require('nlp_compromise');

function listInString(list, text) {
	var text = text.toLowerCase();
	con = false;

	for (var i = 0; i < list.length; i++ ) {
		var loc = text.search(new RegExp("\\b" + list[i] + "\\b"));
		con = con || (loc != -1);
	}

	return con;
}

function recognize_uncertainty(text) {
	uncertainty_terms = ["not sure", 
						 "don't know", 
						 "do not know", 
						 "don't recognize", 
						 "do not recognize"];

	return listInString(uncertainty_terms, text);
}

function recognize_no_person(text) {
	no_person_terms = ["no one",
					   "not anyone",
					   "not a person"];

	return listInString(no_person_terms, text);
}

function recognize_confirmation(text) {
	yes_terms = ["yes",
				 "yea",
				 "ok",
				 "yeah",
				 "right",
				 "affirmative",
				 "aye",
				 "uh-huh",
				 "yup",
				 "yep"];

	return listInString(yes_terms, text);
}

// denests arrays
function flatten(arr) {
	return arr.reduce(function (flat, toFlatten) {
		return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
	}, []);
}

String.prototype.toTitleCase = function(){
  var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

  return this.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
    if (index > 0 && index + match.length !== title.length &&
      match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
      (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }

    if (match.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
};

if (Meteor.isServer) {
	Meteor.publish('conversation_from_cluster', function getConversation(clusterId) {
		var ndocs = Conversations.find({'cluster_id': clusterId}).fetch().length;
		if (ndocs == 0) {
			Conversations.insert({'cluster_id': clusterId, 'state': 'uninitialized', 'history': []});
		}

		return Conversations.find({'cluster_id': clusterId});
	})
}

Meteor.methods({
	// add a new part of the conversation log to the database
	'conversation.addHistory'(clusterId, output, newState) {
		check(output.from, String);
		check(newState, String);

		try {
			console.log(clusterId);
			var current_conversation = Conversations.find({'cluster_id': clusterId}).fetch()[0];
			var current_history = current_conversation.history;
			output['old_state'] = current_conversation.state;
			current_history.push(output);

			console.log([{'_id': current_conversation._id}, {$set: {'history': current_history, 'state': newState}}])

			Conversations.update({'_id': current_conversation._id}, {$set: {'history': current_history, 'state': newState}});
		} catch (e) {
			console.log(e);
			return false;
		}
	},

	'conversation.resetHistory'(clusterId) {
		try {
			Conversations.update({'cluster_id': clusterId}, {$set: {'history': [], 'state': 'uninitialized'}});
		} catch(e) {
			console.log(e);
			return false;
		}
	},

	'person.identifyFromRep'(rep, callback) {
		check(rep, Array);
		check(callback, Function);

		try {
			// get list of all existing face reps

			people = People.find({}).fetch();

			var similarity = [];

			for (var i = 0; i < people.length; i++) {
				var sim = euclideanDistance(people[i].mean_rep, rep);

				similarity.push({'person': people[i], 'similarity': sim});
			}

			similarity.sort(function(a,b) { return a.similarity - b.similarity});

			callback(similarity[0].person);

		} catch(e) {
			console.log(e);
			return false;
		}
	},

	// 'person.identifyFromName'(name, callback) {
	// 	check(name, String);

	// 	try {
	// 		var possible_people = People.find({"name": {"$regex": name, "$options": "i"}}).fetch();


	// 	} catch(e) {
	// 		console.log(e);
	// 		return false;
	// 	}

	// },

	'conversation.addNarrativeToPerson'(person_id, narrative) {
		check(narrative, Object);
		check(person_id, String);

		try {
			People.update({"_id": person_id}, {"$push": {"narrative": narrative}});
		} catch(e) {
			console.log(e);
			return false;
		}
	},

	'conversation.addNarrativeToCluster'(cluster_id, narrative) {
		check(narrative, Object);
		check(cluster_id, String);

		try {
			var cluster_id_object = new Meteor.Collection.ObjectID(cluster_id);
			Clusters.update({"_id": cluster_id_object}, {"$push": {"narrative": narrative}});
		} catch(e) {
			console.log(e);
			return false;
		}
	},

	'conversation.addNarrativeToImage'(image, narrative) {
		check(narrative, Object);
		check(image, String);

		try {
			var image_id = new Meteor.Collection.ObjectID(image);
			LogicalImages.update({"_id": image_id}, {"$push": {"narrative": narrative}});
		} catch(e) {
			console.log(e);
			return false;
		}
	},

	'conversation.rateImage'(image, rating) {
		check(rating, Number);
		check(image, String);

		try {
			var image_id = new Meteor.Collection.ObjectID(image);
			LogicalImages.update({"_id": image_id}, {"$set": {"rating": rating}});
		} catch(e) {
			console.log(e);
			return false;
		}
	},

	'conversation.giveImageRole'(image, role) {
		check(image, String);
		check(role, String);

		try {
			var image_id = new Meteor.Collection.ObjectID(image);
			LogicalImages.update({"_id": image_id}, {"$set": {"role": role}});
		} catch(e) {
			console.log(e);
			return false;
		}
	},

	// allows the user to specifiy the name of a place. DOES NOT denormalize
	'conversation.namePlace'(name, place_id) {
		check(name, String);
		check(place_id, String);

		try {
			var place_id_obj = new Meteor.Collection.ObjectID(place_id);
			Places.update({"_id": place_id_obj}, {"$set": {"name": name}});
		} catch(e) {
			console.log(e);
			return false;
		}

	},

	// specifies the name of a person in an image, and denormalizes data
	'conversation.associateFace'(name, image, facen, cluster_id) {
		check(name, Object);
		check(image, String);
		check(facen, String);

		try {
			facen = parseInt(facen);

			// find image in database with 'image' id
			var image_id = new Meteor.Collection.ObjectID(image);
			photo = LogicalImages.find({"_id": image_id}).fetch()[0];

			if (name != "") {
				//  find person in database with 'name'
				var possible_people = People.find({"name": {"$regex": name.firstName, "$options": "i"}}).fetch();

				if (possible_people.length > 1) {
					var possible_people = People.find({"name": {"$regex": name.firstName + " " + name.lastName, "$options": "i"}}).fetch();
				}

				if (possible_people.length == 0) {
					//  add new face representation
					//  compute new mean representation
					//  add image to image list
					People.insert({"name": name.firstName + " " + name.lastName,
								   "gender": name.gender, 
								   "images": [photo._id],
								   "reps": [photo.openfaces[facen].rep],
								   "mean_rep": photo.openfaces[facen].rep});
				} else if (possible_people.length == 1) {
					var person = possible_people[0];

					//  add image to image list
					var images = person.images;
					images.push(photo._id);

					//  add new face representation
					var reps = person.reps;
					console.log('finding rep');
					console.log(photo.openfaces[facen]);
					reps.push(photo.openfaces[facen]['rep']);

					//  compute new mean representation
					var nreps = reps.length;
					var mean_rep = Array(128);
					var s = 0;

					// mean
					for (var i = 0; i < 128; i++) {
						var m = 0;
						for (var j = 0; j < nreps; j++) {
							m += reps[j][i] * (1.0 / nreps);
						}

						mean_rep[i] = m;
						s += m
					}

					// normalize
					s = Math.sqrt(s);
					for (var i = 0; i < 128; i++) {
						mean_rep[i] /= s;
					}

					People.update({"_id": person._id}, {"$set": {"reps": reps, "images": images, "mean_rep": mean_rep}});

				} else {
					// TODO fix this
					console.log("ERROR: UNHANDLED CASE MULTIPLE NAME MATCHES");
				}

				var person = People.find({"name": {"$regex": name.firstName, "$options": "i"}}).fetch()[0];

				// update image to contain 'name', person id
				if ('identified_faces' in photo) {
					var identified_faces = photo.identified_faces;
				} else {
					var identified_faces = [];
				}

				photo.openfaces[facen]['name'] =  name;
				photo.openfaces[facen]['person_id'] = person['_id'];

				LogicalImages.update({"_id": photo._id}, {"$set": {"openfaces": photo.openfaces}});

				var cluster_id = new Meteor.Collection.ObjectID(cluster_id);
				Clusters.update({"_id": cluster_id}, {"$push": {"people": {'name': name, 'person_id': person['_id']}}});

			} else {
				// name is blank, so this isn't a face. remove it from the image

				var openfaces = photo.openfaces;
				openfaces.splice(facen, 1);

				LogicalImages.update({"_id": photo._id}, {"$set": {"openfaces": openfaces}});
			}

		} catch (e) {
			console.log(e);
			return false;
		}
	},

});

if (Meteor.isServer) {
Meteor.methods({

	'conversation.confirm'(responseText) {
		check(responseText, String);
		this.unblock();
		
		try {
			return recognize_confirmation(responseText);
		} catch (e) {
			console.log(e);

			return false;
		}
	},

	// attempts to generate a follow up question
	//   this is really really shitty right now
	'conversation.followUp'(responseText) {
		check(responseText, String);

		this.unblock();

		try {
			var t = nlp.text(responseText);
			var nouns = t.nouns();
			var longest_nouns = nouns.sort(function(a, b) { return a.normal.length < b.normal.length });
			var longest_noun = longest_nouns[0].normal;

			var reply = "Can you tell me more about " + longest_noun + "?";

			return reply;

		} catch(e) {
			console.log(e);
			return false;
		}
	},

	'conversation.NER'(responseText) {
		check(responseText, String);

		this.unblock();

		try {
			var people = nlp.text(responseText).people();
			console.log(people);

			// exclude some common confounders
			people = people.filter(function(p) { 
				return ((p.normal != 'i') && (p.normal != "you"));
			});

			// okay, maybe a person was mentioned, but they weren't in the NLP compromise list
			if (people.length == 0) {
				var people = nlp.text(responseText).nouns();

				people = people.filter(function(p) { 
					return ((p.normal != 'i') && (p.normal != "you") && !(p.reasoning.includes('lexicon_pass')));
				});

				if (people.length > 0) {
					people = people[people.length - 1].normal.toTitleCase().split(" ");

					if (people.length > 1) {
						people = [{'firstName': people[0], 'lastName': people[1]}];
					} else {
						people = [{'firstName': people[0]}];
					}
				} else {
					people = [];
				}

			} else {
				// extract person data and return
				people = people.map(function(p) {
					var gender = 'n';

					if ('MalePerson' in p.pos) {
						gender = 'm';
					} else if ('FemalePerson' in p.pos) {
						gender = 'f';
					}

					return {'firstName': p.firstName,
							'lastName': p.lastName,
							'gender': gender};
				});
			}

			console.log(people);

			return people;
		} catch(e) {
			console.log(e);
			return false;
		}
	},

	'conversation.whoIs'(responseText) {
  		check(responseText, String);

  		this.unblock();
		try {
			var result = HTTP.call("POST", "http://localhost:3050/parse",
		                       {params: {text: responseText}});
			console.log(result);

			var nlp = JSON.parse(result.content).document;
			var names = [];

			if ('$' in nlp.sentences.sentence) {
				var num_sentences = 1;
			} else {
				var num_sentences = nlp.sentences.sentence.length;
			}

			for (var s = 0; s < num_sentences; s++) {
				if (num_sentences == 1) {
					var sentence = nlp.sentences.sentence;
				} else {
					var sentence = nlp.sentences.sentence[s];
				}

				for (var t = 0; t < sentence.tokens.token.length; t++) {
					if (sentence.tokens.token[t].NER == "PERSON") {
						names.push(sentence.tokens.token[t].word);
					}
				}
			}

			return names;

			// return JSON.parse(result.content);
		} catch (e) {
			console.log(e);
			// Got a network error, time-out or HTTP error in the 400 or 500 range.
			return false;
		}
	},

	'conversation.nounPhrases'(responseText) {
		check(responseText, String);

		this.unblock();
		try{
			// * get parse tree result

			var result = HTTP.call("POST", "http://localhost:3050/parse",
		                       {params: {text: responseText}});

			var nlp = JSON.parse(result.content).document;
			var names = [];

			if ('$' in nlp.sentences.sentence) {
				var num_sentences = 1;
			} else {
				var num_sentences = nlp.sentences.sentence.length;
			}

			all_nouns = []

			for (var s = 0; s < num_sentences; s++) {
				if (num_sentences == 1) {
					var sentence = nlp.sentences.sentence;
				} else {
					var sentence = nlp.sentences.sentence[s];
				}

				var parse_tree = sentence.parsedTree;

				// traverses tree throwing out noun phrases
				function get_noun_phrase(tree) {
					if ((tree.type === "NP") || (tree.type === "NN") || (tree.type === "N")) {
						return tree;
					} else if ('children' in tree) {
						return tree.children.map(function(t) { return get_noun_phrase(t) });
					} else {
						return [];
					}
				}

				// * find all top level noun phrases
				var noun_phrases = flatten(get_noun_phrase(parse_tree));

				// traverses tree concatenating words back together
				function flatten_text(tree) {
					if ("word" in tree) {
						return tree.word;

					} else {
						return tree.children.reduce(function(a,b) {
							if (a.length > 0) {
								return a + " " + flatten_text(b);
							} else {
								return flatten_text(b);
							}
						}, "");
					}
				}

				// * converts noun phrases to text
				var noun_text = noun_phrases.map(flatten_text);
				all_nouns.push(noun_text);
			}

			return flatten(all_nouns);
		} catch(e) {
			console.log(e);
			return false;
		}
	}
});
}