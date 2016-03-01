'use strict';

// find all events
exports.find = function (req, res, next) {

    req.query.name = req.query.name ? req.query.name : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {};
    if (req.query.username) {
        filters.username = new RegExp('^.*?' + req.query.username + '.*$', 'i');
    }

    req.app.db.models.Event.pagedFind({
        filters: filters,
        keys: 'name username desc',
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort
    }, function (err, results) {
        if (err) {
            return next(err);
        }

        if (req.xhr) {
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            results.filters = req.query;
            res.send(results);
        } else {
            results.filters = req.query;
            res.render('events/index', {
                events: results.data
            });
        }
    });
};

// find a particular event's details
exports.details = function (req, res, next) {
    var id = req.params.id;
    req.app.db.models.Event.findById(id).exec(function (err, event) {
        if (err) {
            return next(err);
        }

        if (req.xhr) {
            res.send(event);
        } else {
            res.render('events/details', {
                event: event
            });
        }
    });
};

// show the add event page
exports.showAdd = function (req, res, next) {

    if (!req.isAuthenticated()) {
        req.flash('error', 'You are not logged in yet');
        res.location('/events');
        res.redirect('/events');
    }

    res.render('events/add');
};

// create a new event in db
exports.add = function (req, res, next) {

    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {

        if (!req.body.eventName) {
            workflow.outcome.errors.push('Please enter event name.');
            return workflow.emit('response');
        }

        if (!req.body.eventDesc) {
            workflow.outcome.errors.push('Please enter event desciption.');
            return workflow.emit('response');
        }

        if (!req.body.eventVenue) {
            workflow.outcome.errors.push('Please enter event venue.');
            return workflow.emit('response');
        }

        if (!req.body.eventDate) {
            workflow.outcome.errors.push('Please enter event date.');
            return workflow.emit('response');
        }

        if (!req.body.eventEndTime) {
            workflow.outcome.errors.push('Please enter event start time.');
            return workflow.emit('response');
        }

        if (!req.body.eventEndTime) {
            workflow.outcome.errors.push('Please enter event end time.');
            return workflow.emit('response');
        }

        workflow.emit('createEvent');
    });

    workflow.on('createEvent', function () {
        var newEvent = {
            name: req.body.eventName,
            desc: req.body.eventDesc,
            venue: req.body.eventVenue,
            date: req.body.eventDate,
            startTime: req.body.eventStartTime,
            endTime: req.body.eventEndTime,
            username: req.user.username,
            search: [
                req.body.eventName
            ]
        };
        req.app.db.models.Event.create(newEvent, function (err, event) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.record = event;
            req.flash('success', 'Event added');
            res.location('/events');
            res.redirect('/events');
        });
    });

    workflow.emit('validate');
};

// show the edit event page
exports.showEdit = function (req, res, next) {
    var id = req.params.id;
    req.app.db.models.Event.findById(id).exec(function (err, event) {
        if (err) {
            return next(err);
        }

        if (req.xhr) {
            res.send(event);
        } else {
            res.render('events/edit', {
                event: event
            });
        }
    });
};

// edit the given event
exports.edit = function (req, res, next) {

    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {

        if (!req.body.eventName) {
            workflow.outcome.errors.push('Please enter event name.');
            return workflow.emit('response');
        }

        if (!req.body.eventDesc) {
            workflow.outcome.errors.push('Please enter event desciption.');
            return workflow.emit('response');
        }

        if (!req.body.eventVenue) {
            workflow.outcome.errors.push('Please enter event venue.');
            return workflow.emit('response');
        }

        if (!req.body.eventDate) {
            workflow.outcome.errors.push('Please enter event date.');
            return workflow.emit('response');
        }

        if (!req.body.eventEndTime) {
            workflow.outcome.errors.push('Please enter event start time.');
            return workflow.emit('response');
        }

        if (!req.body.eventEndTime) {
            workflow.outcome.errors.push('Please enter event end time.');
            return workflow.emit('response');
        }

        workflow.emit('editEvent');
    });

    workflow.on('editEvent', function () {
        var updatedEvent = {
            name: req.body.eventName,
            desc: req.body.eventDesc,
            venue: req.body.eventVenue,
            date: req.body.eventDate,
            startTime: req.body.eventStartTime,
            endTime: req.body.eventEndTime,
            username: req.user.username,
            search: [
                req.body.eventName
            ]
        };
        req.app.db.models.Event.findByIdAndUpdate(req.params.id, updatedEvent, function (err, event) {
            if (err) {
                return workflow.emit('exception', err);
            }

            workflow.outcome.record = event;
            req.flash('success', 'Event updated');
            res.location('/events/details/' + req.params.id);
            res.redirect('/events/details/' + req.params.id);
        });
    });

    workflow.emit('validate');
};

// delete the given event
exports.delete = function (req, res, next) {

    var id = req.params.id;
    req.app.db.models.Event.findByIdAndRemove(id).exec(function (err, event) {
        if (err) {
            return next(err);
        }

        if (req.xhr) {
            res.send(event);
        } else {
            req.flash('success', 'Event updated');
            res.location('/events/mine');
            res.redirect('/events/mine');
        }
    });
};

// get all events created by the logged in user
exports.findMyEvents = function (req, res, next) {

    req.query.name = req.query.name ? req.query.name : '';
    req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
    req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
    req.query.sort = req.query.sort ? req.query.sort : '_id';

    var filters = {
        username: req.user.username
    };
    if (req.query.username) {
        filters.username = new RegExp('^.*?' + req.query.username + '.*$', 'i');
    }

    req.app.db.models.Event.pagedFind({
        filters: filters,
        keys: 'name username desc',
        limit: req.query.limit,
        page: req.query.page,
        sort: req.query.sort
    }, function (err, results) {
        if (err) {
            return next(err);
        }

        if (req.xhr) {
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            results.filters = req.query;
            res.send(results);
        } else {
            results.filters = req.query;
            res.render('events/myevents', {
                events: results.data
            });
        }
    });
};