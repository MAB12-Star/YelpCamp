const express = require('express');
const router = express.Router({mergeParams:true});
const reviews = require('../controllers/reviews')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const Campground = require('../models/campground.js');
const Review = require('../models/review');

const catchAsync = require('../utils/catchAsync.js');
const ExpressError = require('../utils/ExpressError.js');

router.post('/',isLoggedIn, validateReview, catchAsync(reviews.newReview));
router.delete('/:reviewId',isLoggedIn,isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;