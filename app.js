const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

require('dotenv').config();

const usersRouter = require('./routes/usersRouter');

const app = express();
const api = process.env.API_URL

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

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

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
    origin: 'http://example.com', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // Allow cookies
    optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(`${api}/users`, usersRouter);

module.exports = app;
