const express = require("express");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

// Middleware to parse JSON request body
app.use(express.json());

// Path to the default template
const templatePath = path.join(__dirname, "templates", "finalLast.html");

app.post("/convert", (req, res) => {
  const { replacements } = req.body;

  // Validate input
  if (!replacements || !Array.isArray(replacements)) {
    return res.status(400).send("Invalid input: 'replacements' must be an array.");
  }

  try {
    // Read the default HTML template
    let htmlContent = fs.readFileSync(templatePath, "utf-8");

    // Perform search and replace for each pair
    for (const { searchWord, replaceWord } of replacements) {
      if (searchWord !== undefined && replaceWord !== undefined) {
        const regex = new RegExp(searchWord, "g");

        if (typeof replaceWord === "string" && (replaceWord.startsWith("data:image") || replaceWord.startsWith("http"))) {
          // Handle image replacement
          htmlContent = htmlContent.replace(regex, `<img src="${replaceWord}" style="width: 550px; height: 400px;" />`);
        } else {
          if (replaceWord == "notFound" || replaceWord == "") {
            console.log("replaceWord", replaceWord, replaceWord == "");

            // Handle empty string replacement
            htmlContent = htmlContent.replace(regex, " ");
          } else {
            // Regular text replacement or empty string
            htmlContent = htmlContent.replace(regex, replaceWord);
          }
        }
      } else {
        console.error(`Invalid replacement for ${searchWord}.`);
      }
    }

    // Generate the PDF
    const pdfPath = path.join(__dirname, "converted", "contrat.pdf");
    (async () => {
      try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        await page.pdf({ path: pdfPath, format: 'A4' });

        await browser.close();

        // Send the PDF file as response
        res.sendFile(pdfPath, (err) => {
          if (err) {
            console.error("Error sending file:", err);
            res.status(500).send("Failed to send the PDF file.");
          }

          // Clean up the temporary file
          fs.unlinkSync(pdfPath);
        });
      } catch (err) {
        console.error("Error generating PDF:", err);
        res.status(500).send("An error occurred during HTML to PDF conversion.");
      }
    })();
  } catch (error) {
    console.error("Error during conversion:", error);
    res.status(500).send("An error occurred during HTML to PDF conversion.");
  }
});

const templatePaths = path.join(__dirname, "templates", "facture.html");

app.post("/convertFacture", (req, res) => {
  const { replacements } = req.body;

  // Validate input
  if (!replacements || !Array.isArray(replacements)) {
    return res.status(400).send("Invalid input: 'replacements' must be an array.");
  }

  try {
    // Read the default HTML template
    let htmlContent = fs.readFileSync(templatePaths, "utf-8");

    // Perform search and replace for each pair
    for (const { searchWord, replaceWord } of replacements) {
      if (searchWord !== undefined && replaceWord !== undefined) {
        const regex = new RegExp(searchWord, "g");

        if (typeof replaceWord === "string" && (replaceWord.startsWith("data:image") || replaceWord.startsWith("http"))) {
          // Handle image replacement
          htmlContent = htmlContent.replace(regex, `<img src="${replaceWord}" style="width: 700px; height: 500px;" />`);
        } else {
          if (replaceWord == "notFound" || replaceWord == "") {
            console.log("replaceWord", replaceWord, replaceWord == "");

            // Handle empty string replacement
            htmlContent = htmlContent.replace(regex, " ");
          } else {
            // Regular text replacement or empty string
            htmlContent = htmlContent.replace(regex, replaceWord);
          }
        }
      } else {
        console.error(`Invalid replacement for ${searchWord}.`);
      }
    }

    // Generate the PDF
    const pdfPath = path.join(__dirname, "converted", "contrat.pdf");
    pdf.create(htmlContent).toFile(pdfPath, (err, result) => {
      if (err) {
        console.error("Error generating PDF:", err);
        return res.status(500).send("An error occurred during HTML to PDF conversion.");
      }

      // Send the PDF file as response
      res.sendFile(result.filename, (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Failed to send the PDF file.");
        }

        // Clean up the temporary file
        fs.unlinkSync(result.filename);
      });
    });
  } catch (error) {
    console.error("Error during conversion:", error);
    res.status(500).send("An error occurred during HTML to PDF conversion.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
