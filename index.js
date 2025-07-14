// File: backend/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const puppeteer = require('puppeteer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up file upload for signature
const upload = multer({ dest: path.join(__dirname, 'uploads/') });

// PDF generation helper
const generatePDF = async (htmlContent, filename) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const filePath = path.join(__dirname, 'pdfs', `${filename}.pdf`);
  await page.pdf({ path: filePath, format: 'A4' });
  await browser.close();
  return filePath;
};

// Route: Freelance Contract
app.post('/generate-contract', upload.single('signature'), async (req, res) => {
  const { clientName, freelancerName, startDate, clauses } = req.body;
  const signaturePath = req.file ? `file://${req.file.path}` : null;
  const signatureHTML = signaturePath ? `<p>Signed:<br><img src='${signaturePath}' width='200'/></p>` : '<p>Signed electronically.</p>';

  const html = `
    <html><body>
    <h1>Freelance Contract</h1>
    <p>This agreement is made between <strong>${clientName}</strong> and <strong>${freelancerName}</strong>.</p>
    <p>It will be effective from <strong>${startDate}</strong>.</p>
    <p>${clauses}</p>
    ${signatureHTML}
    </body></html>`;

  const filename = uuidv4();
  const filePath = await generatePDF(html, filename);
  res.download(filePath);
});

// Route: NDA
app.post('/generate-nda', upload.single('signature'), async (req, res) => {
  const { discloser, receiver, effectiveDate, confidentialInfo } = req.body;
  const signaturePath = req.file ? `file://${req.file.path}` : null;
  const signatureHTML = signaturePath ? `<p>Signed:<br><img src='${signaturePath}' width='200'/></p>` : '<p>Signed electronically.</p>';

  const html = `
    <html><body>
    <h1>Non-Disclosure Agreement</h1>
    <p>This NDA is between <strong>${discloser}</strong> and <strong>${receiver}</strong>.</p>
    <p>Effective date: <strong>${effectiveDate}</strong></p>
    <p>Confidential Information: ${confidentialInfo}</p>
    ${signatureHTML}
    </body></html>`;

  const filename = uuidv4();
  const filePath = await generatePDF(html, filename);
  res.download(filePath);
});

// Route: Employment Letter
app.post('/generate-employment', upload.single('signature'), async (req, res) => {
  const { employeeName, companyName, position, startDate, salary } = req.body;
  const signaturePath = req.file ? `file://${req.file.path}` : null;
  const signatureHTML = signaturePath ? `<p>Signed:<br><img src='${signaturePath}' width='200'/></p>` : '<p>Signed electronically.</p>';

  const html = `
    <html><body>
    <h1>Employment Letter</h1>
    <p>Dear <strong>${employeeName}</strong>,</p>
    <p>We are pleased to offer you the position of <strong>${position}</strong> at <strong>${companyName}</strong>.</p>
    <p>Your start date will be <strong>${startDate}</strong> and your compensation will be <strong>${salary}</strong>.</p>
    ${signatureHTML}
    </body></html>`;

  const filename = uuidv4();
  const filePath = await generatePDF(html, filename);
  res.download(filePath);
});

// Ensure folders exist
['pdfs', 'uploads'].forEach(folder => {
  const dir = path.join(__dirname, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
