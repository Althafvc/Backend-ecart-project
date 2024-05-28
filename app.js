const express = require('express')
const mongoose = require('mongoose')
const dotenv=require('dotenv').config()
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('connect-flash')

const app = express()
const port = process.env.PORT || 3000;

const commonRouter = require ('./Router/common')
const userRouter = require ('./Router/user')
const adminRouter = require('./Router/admin')


app.use(session({
  secret: 'secret key',
  resave: true,
  saveUninitialized: true
}));

app.use(flash())

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('public'))
app.use('/',commonRouter)
app.use('/user',userRouter)
app.use('/admin',adminRouter)
app.set('view engine', 'ejs')
app.set('views', 'views')




app.listen(port, console.log(`server is listening @ port ${port}` ))
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 // 30 seconds
})
.then(()=> console.log('Database connected'))
.catch((err)=> console.log('connection failed',err))


