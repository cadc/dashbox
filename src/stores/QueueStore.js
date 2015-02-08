/**
 * Created by stephenmudra on 18/01/15.
 */

'use strict';

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    PayloadSources = require('constants/PayloadSources'),
    ActionTypes = require('constants/ActionTypes.js'),
    { createStore, mergeIntoBag, isInBag } = require('../utils/StoreUtils'),
    request = require('superagent');

var _queue = {};

var QueueStore = createStore({
    contains(track, fields) {
        return isInBag(_queue, track, fields);
    },

    get(query) {
        return _queue[query];
    },

    loadQueue() {
        request.get('/queue', function (res) {
            if (!res.ok) {
                console.log(res.text);

                AppDispatcher.handleServerAction({
                    type: ActionTypes.REQUEST_QUEUE_ERROR
                });
                return;
            }

            AppDispatcher.handleServerAction({
                type: ActionTypes.REQUEST_QUEUE_SUCCESS,
                entities: res.body
            });
        });
    },

    getSorted() {
        var sorted = [];

        for (var item in _queue) {
            if (_queue.hasOwnProperty(item)) {
                sorted.push(_queue[item]);
            }
        }

        sorted.sort(function(a, b) {
            var aVotes = a.votes ? a.votes.length : 0,
                bVotes = b.votes ? b.votes.length : 0;

            if (aVotes != bVotes) {
                return bVotes - aVotes;
            } else {
                return new Date(a.modified) - new Date(b.modified);
            }
        });

        return sorted;
    },

    getRecent() {
        var sorted = [];

        for (var item in _queue) {
            if (_queue.hasOwnProperty(item)) {
                item = _queue[item];
                for (var i = 0, len = item.votes.length; i < len; i++) {
                    var temp = item.votes[i];
                    temp.id = item.id;
                    sorted.push(temp);
                }
            }
        }

        sorted.sort(function(a, b) {
            return new Date(b.created) - new Date(a.created);
        });

        return sorted;
    }
});

QueueStore.dispatchToken = AppDispatcher.register(function (payload) {
    var action = payload.action,
        entities = action && action.entities,
        fetchedQueue = entities && entities.queue;

    if (fetchedQueue) {
        var transform = (x) => x;

        for (var key in fetchedQueue) {
            if (!fetchedQueue.hasOwnProperty(key)) {
                continue;
            }

            _queue[key] = transform(fetchedQueue[key]);
        }

        QueueStore.emitChange();
    }
});


module.exports = QueueStore;
