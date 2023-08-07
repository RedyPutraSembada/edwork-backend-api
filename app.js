var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');

//* Middleware
const { decodeToken } = require('./app/middlewares');

//* Routes
const productRoute = require('./app/routes/productRoute');
const categoryRoute = require('./app/routes/categoryRoute');
const tagRoute = require('./app/routes/tagRoute');
const authRoute = require('./app/routes/authRoute');
const deliveryAddressRoute = require('./app/routes/deliveryAddressRoute');
const cartRoute = require('./app/routes/cartRoute');
const orderRoute = require('./app/routes/orderRoute');
const invoiceOrder = require('./app/routes/invoiceRoute');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/images', express.static(path.join(__dirname, 'public/images/products')));

app.use(decodeToken());

// app.use('/images', express.static('public'));
app.use('/auth', authRoute);
app.use('/api', categoryRoute);
app.use('/api', productRoute);
app.use('/api', tagRoute);
app.use('/api', deliveryAddressRoute);
app.use('/api', cartRoute);
app.use('/api', orderRoute);
app.use('/api', invoiceOrder);

//home
app.use('/', function (req, res) {
  res.render('index', {
    title: 'Eduwork Api Service'
  });
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
