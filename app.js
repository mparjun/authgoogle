const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const morgan = require('morgan')
const passport = require('passport')
const methodOverride = require('method-override')
const session = require('express-session')
const path = require('path')
const exphbs = require('express-handlebars')
const MongoStore = require('connect-mongo')
const connectDB = require('./config/db')




// load config
dotenv.config({ path: './config/config.env' })

// passport config
require('./config/passport')(passport)
connectDB()
const app = express()

// Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


// Method override
app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )
const {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
  } = require('./helpers/hbs')

if (process.env.NODE_ENV ===  'development'){
    app.use(morgan('dev'))
}

app.engine('.hbs', exphbs({helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select,
  }, extname: '.hbs', defaultLayout: 'main'}));
app.set('view engine', '.hbs');
//session middlware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
   
  }))

  // Set global var
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
  })

//passport midleware
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(path.join(__dirname,'public')))
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))
const PORT = process.env.PORT || 3000


app.listen(PORT)
