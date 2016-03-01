'use strict';

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.set('X-Auth-Required', 'true');
    req.session.returnUrl = req.originalUrl;
    res.redirect('/login/');
}

function ensureAdmin(req, res, next) {
    if (req.user.canPlayRoleOf('admin')) {
        return next();
    }
    res.redirect('/');
}

function ensureAccount(req, res, next) {
    if (req.user.canPlayRoleOf('account')) {
        if (req.app.config.requireAccountVerification) {
            if (req.user.roles.account.isVerified !== 'yes' && !/^\/account\/verification\//.test(req.url)) {
                return res.redirect('/account/verification/');
            }
        }
        return next();
    }
    res.redirect('/');
}

exports = module.exports = function (app, passport) {
    
    //front end
    app.get('/', require('./views/index').init);
    app.get('/about/', require('./views/about/index').init);
    app.get('/contact/', require('./views/contact/index').init);
    app.post('/contact/', require('./views/contact/index').sendMessage);
    
    // events
    app.get('/events/', require('./views/events/index').find);
    app.get('/events/show/:id', require('./views/events/index').details);
    app.get('/events/add', require('./views/events/index').add);
    app.post('/events', require('./views/events/index').create);
    app.get('/myevents', require('./views/myevents/index').find);
    
    //sign up
    app.get('/signup/', require('./views/signup/index').init);
    app.post('/signup/', require('./views/signup/index').signup);

    //login/out
    app.get('/login/', require('./views/login/index').init);
    app.post('/login/', require('./views/login/index').login);
    app.get('/login/forgot/', require('./views/login/forgot/index').init);
    app.post('/login/forgot/', require('./views/login/forgot/index').send);
    app.get('/login/reset/', require('./views/login/reset/index').init);
    app.get('/login/reset/:email/:token/', require('./views/login/reset/index').init);
    app.put('/login/reset/:email/:token/', require('./views/login/reset/index').set);
    app.get('/logout/', require('./views/logout/index').init);

    //account
    app.all('/account*', ensureAuthenticated);
    app.all('/account*', ensureAccount);
    app.get('/account/', require('./views/account/index').init);

    //route not found
    app.all('*', require('./views/http/index').http404);
};