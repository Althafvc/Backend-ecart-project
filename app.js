const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv=require('dotenv').config()
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt')
const session = require('express-session')
const commonRouter = require ('./Router/common')
const flash = require('connect-flash')
const userRouter = require ('./Router/user')
const { defaultRoute } = require('./Router/common')
const adminRouter = require('./Router/admin')


app.use(session({
  secret: 'secret key',
  resave: true,
  saveUninitialized: true
}));

app.use(flash())


app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
app.use('/',commonRouter)
app.use('/user',userRouter)
app.use('/admin',adminRouter)
app.set('view engine', 'ejs')
app.set('views', 'views')




app.listen(port, console.log(`server is listening @ port ${port}` ))

mongoose.connect('mongodb://127.0.0.1:27017/stylesphere')
.then(()=> console.log('Database connected'))
.catch((err)=> console.log('connection failed',err))

