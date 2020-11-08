const express = require("express");
const employeeRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetRouter = require('./timesheets.js');

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

employeeRouter.param('employeeId', (req, res, next, empid) => {
    db.get('SELECT * FROM Employee WHERE id = $id', {$id: empid},
        (err, employee) => {
            if (err) {
                next(err);
            } else if (employee) {
                req.employee = employee;
                next();
            } else {
                res.sendStatus(404);
            }
        });
});

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

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

employeeRouter.get('/:employeeId', (req,res,next) => {
    res.status(200).json({employee: req.employee});
})

employeeRouter.put('/:employeeId',validateEmployee,(req,res,next) => {
    console.log(req.name, req.position,req.wage,req.isCurrentEmployee)
    db.run(`UPDATE Employee SET name = ?, position = ?,wage = ?,is_current_employee = ? where id = ?`,[
        req.name,
        req.position,
        req.wage,
        req.isCurrentEmployee,
        req.params.employeeId
    ], function(err){
        if(err){
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, employee) => {
                res.status(200).json({employee:employee})
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

employeeRouter.delete('/:employeeId',(req,res,next) => {
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = ?`,[
        req.params.employeeId
    ],function(err){
        if(err){
            next(err)
        }else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
                    (err, employee) => {
                        res.status(200).json({employee: employee});
                    });
        }
    })
});



module.exports = employeeRouter;