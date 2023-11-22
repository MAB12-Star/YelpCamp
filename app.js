if(process.NODE_ENV !== 'production'){
    require('dotenv').config();
};

const express = require ('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const path= require('path');
const mongoose = require ('mongoose');

const morgan = require('morgan');
const methodOverride = require ('method-override');
const passport = require ('passport');
const LocalStrategy = require ('passport-local');
const User = require('./models/user');
const mongoSanitize = require ('express-mongo-sanitize');
const helmet = require('helmet');
const favicon = require('serve-favicon');


const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewsRoutes = require('./routes/reviews.js')

const cookieParser = require('cookie-parser');

const flash = require('connect-flash');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Admin01:aKUp1aVGsYuAebAs@cluster0.omts09l.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);
// const dbUrl = process.env.DB_URL;

// 'mongodb://127.0.0.1:27017/yelp-camp'

// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set('view engine', 'ejs');
app.engine('ejs', ejsMate); // Corrected this line to use ejsMate

app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(morgan('dev'));

app.use(mongoSanitize());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const secret = process.env.SECRET ||'thisshouldbeabettersecret';
const store = MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017/yelp-camp' || "mongodb+srv://Admin01:aKUp1aVGsYuAebAs@cluster0.omts09l.mongodb.net/?retryWrites=true&w=majority",
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});


// const store = new MongoDBStore({
//     url: mongodb://127.0.0.1:27017/yelp-camp' || "mongodb+srv://Admin01:aKUp1aVGsYuAebAs@cluster0.omts09l.mongodb.net/?retryWrites=true&w=majority",
//     secret: 'testing',
//     touchAfter: 24 * 3600
// })

store.on('error', function(e){
    console.log('Session Store Error',e)
})


const sessionConfig = {
    store:store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(helmet({contentSecurityPolicy: false}));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
  
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    'https://cdn.jsdelivr.net/',
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/diykkzato/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/","https://www.freepik.com/",'https://img.freepik.com/','https://howtostartanllc.com'
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    req.requestTime = Date.now();
    console.log(req.method,req.path);
    next();
})

app.use((req,res,next) =>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews',reviewsRoutes);


app.get('/', (req,res) => {
    res.render('home')
});

app.get('/javascripts/validateForms.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/javascripts/validateForms.js'));
  });

app.all('*', (req,res, next) => {
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode = 500, message ='Something went wrong'} = err;
    if(!err.message) err.message = 'Oh No, something went wrong!'
    res.status(statusCode).render('error',{err});
})
app.use((req,res)=>{
    res.status(404).send('Not Found')
})

app.listen(10000, () => {
    console.log('Serving on port 3000')
})

