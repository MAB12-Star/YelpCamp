const mongoose = require ('mongoose');
const cities = require ('./cities');
const {places,descriptors} = require ('./seedHelpers.js')
const Campground = require('../models/campground.js');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random()*array.length)];


const seedDB= async () => {
    await Campground.deleteMany({});
    for(let i=0; i < 300; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price =Math.floor(Math.random()*20)+10;
        const camp = new Campground({
            author:'6553be7f06214f6dec48ae20',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/diykkzato/image/upload/v1700176575/YelpCamp/hvz9lznr7axule1vihar.jpg',
                  filename: 'YelpCamp/hvz9lznr7axule1vihar',
                }
              ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil quasi fugiat reprehenderit pariatur recusandae repellendus culpa incidunt similique amet quae ipsum, quidem assumenda delectus, omnis blanditiis sunt saepe accusamus iste?',
            price,
            geometry: { 
                type: 'Point', 
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
                    

        }})
        await camp.save();
    }

}

seedDB().then(() =>{
    mongoose.connection.close()
})