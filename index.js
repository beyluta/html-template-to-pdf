const html_to_pdf = require("html-pdf-node");
const fs = require("fs");

/**
 * This function generates a PDF file from a html template and returns it as a blob.
 * @description
 * For more information about the html-pdf-node package including additional
 * pdf generation options, visit https://www.npmjs.com/package/html-pdf-node.
 * @param {string} path - Path to the html file.
 * @param {object | null} context - Options for the PDF generation.
 * @param {object} opts - Options for the PDF generation. Visit https://www.npmjs.com/package/html-pdf-node for more information.
 * @returns {Promise<Buffer>} The generated PDF file as a blob.
 * @example const buffer = await generatePDF('path/to/file.html', { name: 'John Doe' });
 */
async function generatePDF(path, context = null, opts = {}) {
  const file = {
    content: await dynamicLoadPDF(path, context),
  };

  return await new Promise((resolve, reject) => {
    html_to_pdf
      .generatePdf(file, opts)
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
 * Navigates a string hierarchy and returns the last value.
 * @param {string} str - The string to navigate.
 * @param {object} context - The context object to navigate.
 * @returns {string} The value from the context object.
 * @example
 * const str = navigateStringHierarchy("employee.salary", { employee: { salary: "$90000" } }});
 * console.log(str); // Returns "$90000"
 */
function navigateStringHierarchy(str, context) {
  if (!str.includes(".")) {
    return context[str];
  }

  const hierarchy = str.split(".");
  context = context[hierarchy[0]];
  let newStr = "";
  for (let i = 0; i < hierarchy.length; i++) {
    if (i > 1) {
      newStr += ".";
    }

    if (i > 0) {
      newStr += hierarchy[i];
    }
  }
  return navigateStringHierarchy(newStr, context);
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

        return replaceBracesWithValues(text, context);
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
  let nestCount = 0;
  for (let i = 0; i < text.length; i++) {
    if (
      i - 1 > -1 &&
      text[i] === "{" &&
      text[i - 1] === "?" &&
      startIndex === null
    ) {
      startIndex = i - 1;
      continue;
    } else if (
      i - 1 > -1 &&
      text[i] === "{" &&
      text[i - 1] === "?" &&
      startIndex !== null
    ) {
      nestCount++;
    }

    if (
      i + 1 < text.length &&
      text[i] === "}" &&
      text[i + 1] === "?" &&
      startIndex !== null &&
      nestCount === 0
    ) {
      endIndex = i + 1;

      const replaceText = () => {
        text =
          text.substring(0, startIndex) +
          content +
          text.substring(endIndex + 1);
      };

      const replaceEmptyText = () => {
        text = text.substring(0, startIndex) + text.substring(endIndex + 1);
      };

      if (field.trim()[0] !== "!") {
        if (context[field.trim()]) {
          replaceText();
        } else {
          replaceEmptyText();
        }
      } else {
        field = field.trim().substring(1);
        if (!context[field.trim()]) {
          replaceText();
        } else {
          replaceEmptyText();
        }
      }

      return evaluateConditions(text, context);
    } else if (
      i + 1 < text.length &&
      text[i] === "}" &&
      text[i + 1] === "?" &&
      startIndex !== null &&
      nestCount > 0
    ) {
      nestCount--;
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

module.exports = generatePDF;
