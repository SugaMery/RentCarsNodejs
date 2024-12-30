const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const outputFileName = `converted-${Date.now()}.pdf`;
  const outputPath = path.join(__dirname, 'converted', outputFileName);

  try {
    // Convert Word to HTML
    const wordContent = fs.readFileSync(filePath);
    const result = await mammoth.extractRawText({ buffer: wordContent });

    // Convert HTML to PDF
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputPath));
    doc.text(result.value);
    doc.end();

    // Return PDF file URL
    res.send(`http://your-nodejs-server-url/converted/${outputFileName}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error converting file');
  } finally {
    fs.unlinkSync(filePath); // Clean up uploaded file
  }
});

// Serve converted PDFs
app.use('/converted', express.static(path.join(__dirname, 'converted')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
