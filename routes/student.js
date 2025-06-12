const express = require('express');
const { create } = require('xmlbuilder2');
const fs   = require('fs');
const path = require('path');
const libxml = require('libxmljs2');

const router = express.Router();

router.post('/', (req, res) => {
  const student = req.body;

  // Creating the XML file using xmlbuilder2
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
        .up()           // </address>
      .up()             // </student>
    .up()               // </students>
  .end({ prettyPrint: true });

  // Saving the generated xml file to schema/<studentID>.xml
  const outDir = path.join(__dirname, '..', 'schema');
  const xmlPath = path.join(outDir, `${student.studentID}.xml`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(xmlPath, xmlString, 'utf8');

  // Validating the XML file against the XSD schema
  const xsdPath = path.join(outDir, 'student.xsd');
  const xmlData = fs.readFileSync(xmlPath, 'utf8');
  const xsdData = fs.readFileSync(xsdPath, 'utf8');
  const xmlDoc = libxml.parseXml(xmlData);
  const xsdDoc = libxml.parseXml(xsdData);
  if (!xmlDoc.validate(xsdDoc)) {
    const errors = xmlDoc.validationErrors
      .map(e => `Line ${e.line}: ${e.message.trim()}`)
      .join('<br>');
    return res.status(400).send(
      `<h2 style=\"color:red; align:center\">❌ Validation failed:</h2><p>${errors}</p>`
    );
  }

  // Sending a friendly response
  res.send(`
    <h1 align="center" style="font-family:sans-serif;color:green;">
      ✔ XML generated and validated succesfully !
      <a href="/schema/${student.studentID}.xml\" target=\"_blank\">${student.studentID}.xml</a>
    </h1>
  `);
});

module.exports = router;