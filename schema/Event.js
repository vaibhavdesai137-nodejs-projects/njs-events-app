'use strict';

exports = module.exports = function (app, mongoose) {

    var eventSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        desc: String,
        venue: String,
        date: Date,
        startTime: String,
        endTime: String,
        username: {
            type: String,
            required: true
        },
        search: [String]
    });

    eventSchema.plugin(require('./plugins/pagedFind'));

    app.db.model('Event', eventSchema);
};