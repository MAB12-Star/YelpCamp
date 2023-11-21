const express = require ('express');
const router = express.Router();
const users = require('../controllers/users')
const passport = require ('passport');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');
const User = require ('../models/user');

router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.login)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginSuccess);

router.get('/logout', users.logout);

module.exports = router;
