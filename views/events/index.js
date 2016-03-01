'use strict';

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

exports.details = function (req, res, next) {
    var id = req.params.id;
    console.log('EVENT...' + id);
    req.app.db.models.Event.findById(id).exec(function (err, event) {
        if (err) {
            return next(err);
        }

        if (req.xhr) {
            res.send(event);
        } else {
            console.log('EVENT...' + JSON.stringify(event));
            res.render('events/details', {
                event: event
            });
        }
    });
};

exports.add = function (req, res, next) {

    if (!req.isAuthenticated()) {
        req.flash('error', 'You are not logged in yet');
        res.location('/events');
        res.redirect('/events');
    }

    res.render('events/add');

};

exports.create = function (req, res, next) {

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