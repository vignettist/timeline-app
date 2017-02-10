import { Mongo } from 'meteor/mongo';
import { HTTP } from 'meteor/http';
import { check } from 'meteor/check';

export const Conversations = new Mongo.Collection('conversations');

function listInString(list, text) {
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
				 "yup"];

	return listInString(yes_terms, text);
}

if (Meteor.isServer) {
	Meteor.publish('conversation_from_cluster', function getConversation(clusterId) {
		return Conversations.find({'cluster_id': clusterId});
	})
}

Meteor.methods({
	// add a new part of the conversation log to the database
	'conversation.addHistory'(clusterId, output, newState) {
		check(output.content, String);
		check(output.from, String);
		check(newState, String);
		this.unblock();

		try {
			console.log(clusterId);
			var current_conversation = Conversations.find({'cluster_id': clusterId}).fetch()[0];
			var current_history = current_conversation.history;
			current_history.push(output);

			console.log([{'_id': current_conversation._id}, {$set: {'history': current_history, 'state': newState}}])

			Conversations.update({'_id': current_conversation._id}, {$set: {'history': current_history, 'state': newState}});
		} catch (e) {
			console.log(e);
			return false;
		}
	},

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
	}
});