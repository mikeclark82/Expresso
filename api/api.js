const express = require('express');
const apiRouter = express.Router();

const employeeRouter = require('./employee.js');

apiRouter.use("/employees",employeeRouter)

module.exports = apiRouter;

