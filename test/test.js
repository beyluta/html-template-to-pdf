/**
 * Test file to test the generatePDF function.
 * The output.pdf file will be generated in the root directory.
 */

const fs = require("fs");
const generatePDF = require("../index.js");

async function main() {
  const arrayBuffer = await generatePDF("./test/test.html", {
    show: true,
    employeeName: "John Doe",
    isHomeless: false,
    salary: {
      amount: 90000,
      currency: "USD",
    },
    profession: {
      isUnemployed: false,
      title: "Software Engineer",
    },
    address: {
      street: "123 Main St.",
      city: "New York",
      state: "NY",
    }
  });
  const fileStream = fs.createWriteStream("output.pdf");
  fileStream.write(Buffer.from(arrayBuffer));
  fileStream.end();
}

main();