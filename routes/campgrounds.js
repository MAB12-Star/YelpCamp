const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync.js');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const Campground = require('../models/campground.js');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.newSuccess));

router.get('/new', isLoggedIn, campgrounds.new);

router.route('/:id')
  .get(catchAsync(campgrounds.show))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.editShow))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.delete));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.edit));

module.exports = router;
