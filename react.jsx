// Legal Document Automation Platform
// Structure: React (frontend) + Express (backend) + MongoDB (database)
// This is a simplified MVP version with PDF generation (no eSign in this file)

// == FRONTEND: React App (main files) ==
// File: src/App.jsx
import React, { useState } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    clientName: "",
    freelancerName: "",
    startDate: ""
  });
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generatePDF = async () => {
    const res = await axios.post("http://localhost:5000/generate-pdf", formData, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    setPdfUrl(url);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Freelance Contract Generator</h1>
      <input className="border p-2 w-full mb-2" name="clientName" placeholder="Client Name" onChange={handleChange} />
      <input className="border p-2 w-full mb-2" name="freelancerName" placeholder="Freelancer Name" onChange={handleChange} />
      <input className="border p-2 w-full mb-2" name="startDate" placeholder="Start Date" onChange={handleChange} />
      <button className="bg-blue-500 text-white px-4 py-2" onClick={generatePDF}>Generate PDF</button>
      {pdfUrl && <a className="block mt-4 text-blue-700" href={pdfUrl} download="contract.pdf">Download PDF</a>}
    </div>
  );
}

export default App;

// == BACKEND: Express Server ==
// File: server/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/generate-pdf", async (req, res) => {
  const { clientName, freelancerName, startDate } = req.body;
  const htmlTemplate = `
    <html>
      <body style="font-family: sans-serif;">
        <h1 style="text-align: center;">Freelance Contract</h1>
        <p>This agreement is made between <strong>${clientName}</strong> and <strong>${freelancerName}</strong>.</p>
        <p>It will be effective from <strong>${startDate}</strong>.</p>
        <p>All terms and conditions apply as agreed upon.</p>
        <p>Signed electronically.</p>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlTemplate);
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": "attachment; filename=contract.pdf",
  });
  res.send(pdfBuffer);
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));

// == Notes ==
// 1. Install dependencies:
//    Frontend: npm install axios
//    Backend: npm install express cors body-parser puppeteer
// 2. Ensure backend is running before using frontend.
// 3. eSign integration with NSDL/Digio will be added next.
