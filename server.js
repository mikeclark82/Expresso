const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(morgan('dev'));
app.use(errorHandler());
app.use(bodyParser.json());

const apiRouter = require('./api/api.js');
app.use('/api',apiRouter);

app.listen(PORT,()=>{
    console.log(`App listening on ${PORT}`);
});

module.exports = app;