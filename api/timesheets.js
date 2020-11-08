const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const validateTimesheet = (req, res, next) => {
    req.hours = req.body.timesheet.hours;
    req.rate = req.body.timesheet.rate;
    req.date = req.body.timesheet.date;
    if (!req.hours || !req.rate || !req.date) {
        return res.sendStatus(400);
    } else {
        next();
    }
};

timesheetsRouter.param('timesheetId', (req, res, next, id) => {
    db.get(`SELECT * FROM Timesheet WHERE id = ${id}`,
        (err, timesheet) => {
            if (err) {
                next(err);
            } else if (timesheet) {
                next();
            } else {
                res.sendStatus(404);
            }
        });
});

timesheetsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`,
        (err, timesheet) => {
            if (err) {
                next(err);
            } else {
                res.status(200).json({timesheets: timesheet});
            }
        });
});

timesheetsRouter.post('/', validateTimesheet, (req, res, next) => {
    db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id)
          VALUES ("${req.hours}", "${req.rate}", "${req.date}", ${req.params.employeeId})`,
        function(err, timesheet) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`,
                    (err, timesheet) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(201).json({timesheet: timesheet});
                        }
                    });
            }
        });
});

timesheetsRouter.put('/:timesheetId', validateTimesheet, (req, res, next) => {
    db.run(`UPDATE Timesheet SET hours = "${req.hours}", rate = "${req.rate}",
            date = "${req.date}", employee_id = ${req.params.employeeId}
          WHERE id = ${req.params.timesheetId}`,
        function(err, timesheet) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`,
                    (err, timesheet) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(200).json({timesheet: timesheet});
                        }
                    });
            }
        });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`,
        (err) => {
            if (err) {
                next(err);
            } else {
                res.sendStatus(204);
            }
        });
});

module.exports = timesheetsRouter;