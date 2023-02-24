/**
 * Test file to test the generatePDF function.
 * The output.pdf file will be generated in the root directory.
 */

const fs = require("fs");
const generatePDF = require("../index.js");

async function main() {
  const arrayBuffer = await generatePDF("./test/test.html", {
    employeeName: "John Doe",
    salary: "$9000",
    show: true,
    isUnemployed: false,
  });
  const fileStream = fs.createWriteStream("output.pdf");
  fileStream.write(Buffer.from(arrayBuffer));
  fileStream.end();
}

main();