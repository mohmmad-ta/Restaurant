const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
require('dotenv').config();

const usersRouter = require('./routes/usersRouter');
const mealsRouter = require('./routes/mealsRouter');
const ordersRouter = require('./routes/ordersRouter');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const api = process.env.API_URL
console.log(api)
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(logger('dev'));
}

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 300, // limit each IP to 300 requests per windowMs
    message: 'Too many requests from this IP, please try again in an hour!',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '15kb' }));



// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
        ]
    })
);

// Enable CORS for all routes
app.use(cors());
const corsOptions = {
    origin: '*', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(`${api}/auth`, usersRouter);
app.use(`${api}/meal`, mealsRouter);
app.use(`${api}/order`, ordersRouter);
app.use(`${api}/review`, reviewRoutes);
app.use(`${api}/category`, categoryRoutes);



app.use(globalErrorHandler);
module.exports = app;
