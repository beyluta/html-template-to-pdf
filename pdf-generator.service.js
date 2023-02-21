import html_to_pdf from "html-pdf-node";
import fs from "fs";

/**
 * This function generates a PDF file from a html template and returns it as a blob.
 * @param {string} path - Path to the html file.
 * @param {object | null} context - Options for the PDF generation.
 * @returns {Promise<Buffer>} The generated PDF file as a blob.
 * @example const buffer = await generatePDF('path/to/file.html', { name: 'John Doe' });
 */
export async function generatePDF(path, context = null) {
  const options = {
    format: "A4",
    margin: { top: "50px", bottom: "50px", left: "50px", right: "50px" },
  };
  const file = {
    content: await dynamicLoadPDF(path, context),
  };

  return await new Promise((resolve, reject) => {
    html_to_pdf
      .generatePdf(file, options)
      .then((pdfBuffer) => {
        resolve(pdfBuffer);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Loads a html file and returns it as a string.
 * @param {string} path - Path to the html file.
 * @param {object | null} context - Options for the PDF generation.
 * @returns {Promise<string>} The html file as a string.
 * @example const html = await dynamicLoadPDF('path/to/file.html', { name: 'John Doe' });
 */
async function dynamicLoadPDF(path, context = null) {
  return await new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) reject(err);
      resolve(
        replaceBracesWithValues(evaluateConditions(data, context), context)
      );
    });
  });
}

/**
 * Replaces all braces with the corresponding value from the context object.
 * @param {string} text - The text to replace the braces in.
 * @param {object | null} context - Options for the PDF generation.
 * @returns {string} The text with the replaced braces.
 * @example replaceBracesWithValues("Hello {name}!", { name: "World" });
 */
function replaceBracesWithValues(text, context) {
  if (context === null) return text;

  let isField = false;
  let currentField = "";
  let startIndex, endIndex;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") {
      isField = true;
      currentField = "";
      startIndex = i;
      continue;
    }

    if (text[i] === "}" && isField) {
      isField = false;
      endIndex = i;

      if (context[currentField]) {
        text =
          text.substring(0, startIndex) +
          context[currentField] +
          text.substring(endIndex + 1);
      }
      continue;
    }

    if (isField && text[i] !== " ") {
      currentField += text[i];
    }
  }

  return text;
}

/**
 * Hides or shows content based on existing keys in the context object.
 * @param text - The text to evaluate the conditions in.
 * @param context - The context object.
 * @returns {string} The text with the evaluated conditions.
 * @example evaluateConditions("Hello ?{name World}?!", { name: "World" });
 */
function evaluateConditions(text, context) {
  if (context === null) return text;

  let startIndex = null;
  let endIndex = null;
  let field = "";
  let content = "";
  for (let i = 0; i < text.length; i++) {
    if (i - 1 > -1 && text[i] === "{" && text[i - 1] === "?") {
      startIndex = i - 1;
      continue;
    }

    if (
      i + 1 < text.length &&
      text[i] === "}" &&
      text[i + 1] === "?" &&
      startIndex !== null
    ) {
      endIndex = i + 1;

      if (context[field.trim()]) {
        text =
          text.substring(0, startIndex) +
          content +
          text.substring(endIndex + 1);
      } else {
        text = text.substring(0, startIndex) + text.substring(endIndex + 1);
      }

      return evaluateConditions(text, context);
    }

    if (startIndex !== null) {
      if (text[i] !== " " && !content.length) {
        field += text[i];
      }

      if (field.length && !content.length && text[i] === " ") {
        content = text[i];
        continue;
      }

      if (content.length) {
        if (content[0] === " ") content = "";
        content += text[i];
      }
    }
  }

  return text;
}
