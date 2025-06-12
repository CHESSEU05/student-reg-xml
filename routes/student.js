const express = require('express');
const { create } = require('xmlbuilder2');
const fs = require('fs');
const path = require('path');
const libxml = require('libxmljs2');
const db = require('../db/db');  // promise-based pool

const router = express.Router();

router.post('/', (req, res) => {
  const student = req.body;

  // 1) Build XML string
  const xmlString = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('students')
      .ele('student')
        .ele('studentID').txt(student.studentID).up()
        .ele('firstName').txt(student.firstName).up()
        .ele('lastName').txt(student.lastName).up()
        .ele('gender').txt(student.gender).up()
        .ele('dateOfBirth').txt(student.dateOfBirth).up()
        .ele('email').txt(student.email).up()
        .ele('phoneNumber').txt(student.phoneNumber).up()
        .ele('GPA').txt(student.GPA).up()
        .ele('program').txt(student.program).up()
        .ele('address')
          .ele('city').txt(student.city).up()
          .ele('quarter').txt(student.quarter).up()
          .ele('street').txt(student.street).up()
        .up()
      .up()
    .up()
  .end({ prettyPrint: true });

  // 2) Save XML file
  const schemaDir = path.join(__dirname, '..', 'schema');
  const xmlPath = path.join(schemaDir, `${student.studentID}.xml`);
  fs.mkdirSync(schemaDir, { recursive: true });
  fs.writeFileSync(xmlPath, xmlString, 'utf8');
  console.log(`XML written to ${xmlPath}`);

  // 3) Validate against XSD
  const xsdPath = path.join(schemaDir, 'student.xsd');
  const xmlData = fs.readFileSync(xmlPath, 'utf8');
  const xsdData = fs.readFileSync(xsdPath, 'utf8');
  const xmlDoc = libxml.parseXml(xmlData);
  const xsdDoc = libxml.parseXml(xsdData);

  if (!xmlDoc.validate(xsdDoc)) {
    const errors = xmlDoc.validationErrors
      .map(e => `Line ${e.line}, Col ${e.column}: ${e.message.trim()}`)
      .join('\n');
    console.error('Validation errors:', errors);
    return res.status(400).send(`<h2 style=\"color:red;\">Validation failed:</h2><pre>${errors}</pre>`);
  }

  // 4) Insert into MySQL only if valid
  const sql = `
    INSERT INTO tbl_student_record
      (studentID, firstName, lastName, gender, dateOfBirth,
       email, phoneNumber, GPA, program, city, quarter, street)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    student.studentID,
    student.firstName,
    student.lastName,
    student.gender,
    student.dateOfBirth,
    student.email,
    student.phoneNumber,
    parseFloat(student.GPA),
    student.program,
    student.city,
    student.quarter,
    student.street
  ];

  db.query(sql, values)
    .then(() => {
      console.log('Record inserted into database');
      res.send(
        `<h2 style=\"color:green; font-family:sans-serif; text-align:center;\">
          ✔ XML validated and data saved successfully into DB!<br>
          <a href=\"/schema/${student.studentID}.xml\" target=\"_blank\">${student.studentID}.xml</a>
        </h2>`
      );
    })
    .catch(err => {
      console.error('DB error:', err);
      res.status(500).send(`<h2 style=\"color:red; text-align:center;\">DB error: ${err.message}</h2>`);
    });
});

module.exports = router;