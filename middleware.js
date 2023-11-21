const {campgroundSchema, reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError.js');
const Campground = require('./models/campground.js');
const Review = require('./models/review')



module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // add this line
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// module.exports.validateCampground = (req,res,next)=>{
//     const  {error} = campgroundSchema.validate(req.body)
//     if(error){
//         const msg = error.details.map(el => el.message).join(',')
//         throw new ExpressError(msg,400)
//         } else{
//         next();
//     }
// }

module.exports.validateCampground = (req, res, next) => {
    console.log(req.body); // Add this line for debugging
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

module.exports.validateReview = (req,res,next) => {
    const {error} = reviewSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}

module.exports.isAuthor = async(req,res,next)=>{
    const{id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)) {
        req.flash('error','You dont have permission');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    
    try {
        const review = await Review.findById(reviewId);

        if (!review) {
            req.flash('error', 'Review not found');
            return res.redirect(`/campgrounds/${id}`);
        }

        if (!review.author.equals(req.user._id)) {
            req.flash('error', 'You do not have permission');
            return res.redirect(`/campgrounds/${id}`);
        }

        next();
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong');
        res.redirect(`/campgrounds/${id}`);
    }
};

