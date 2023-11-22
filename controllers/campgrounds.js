const Campground = require('../models/campground.js');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require ('@mapbox/mapbox-sdk/services/geocoding');
const campground = require('../models/campground.js');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding ({ accessToken: mapBoxToken});


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.new = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.newSuccess = async (req, res, next) => {
    try {
        const geoData = await geoCoder
            .forwardGeocode({
                query: req.body.campground.location,
                limit: 1
            })
            .send();

        const newCampground = new Campground(req.body.campground);
        newCampground.geometry = geoData.body.features[0].geometry;
        newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        newCampground.author = req.user._id;
        await newCampground.save();
        req.flash('success', 'Successfully made a new campground!');
        res.redirect(`/campgrounds/${newCampground._id}`);
    } catch (err) {
        next(err);
    }
};

module.exports.show = (async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!campground){
        req.flash('error', 'Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
  });

  module.exports.edit = (async (req,res) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You dont have permission');
        return res.redirect(`/campgrounds/${id}`);
    }
    res.render('campgrounds/edit',{ campground }) 
});

module.exports.editShow = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);

    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
          await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    await campground.save();
    req.flash('success', 'Successfully Updated Campground');
    res.redirect(`/campgrounds/${campground._id}`);
};


module.exports.delete = ( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted Campground')
    res.redirect('/campgrounds');
});
