const express = require("express");
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const validateEmployee = (req,res,next) => {
    req.name = req.body.employee.name;
    req.position = req.body.employee.position;
    req.wage = req.body.employee.wage;
    req.isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!req.name || !req.position || !req.wage) {
        return res.status(400).send();
    }
    else {
        next();
    }
};

employeeRouter.get('/', (req,res,next) => {
    db.all(`SELECT * FROM Employee WHERE 
     is_current_employee = 1`,function(err,employees){
         if(err){
             next(err)
         }else {
             res.status(200).json({
                 'employees':employees
             });
         }

     })
});

employeeRouter.post('/',validateEmployee,(req,res,next) => {
    db.run(`INSERT INTO Employee (name, position,wage,is_current_employee) VALUES
     (?,?,?,?)`,[req.name,req.position,req.wage,req.isCurrentEmployee],function(err,employee) {
         if(err) {
             next(err);
         } else {
             db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, employee) => {
                 res.status(201).json({employee:employee})
             });
         }
     });
});

module.exports = employeeRouter;