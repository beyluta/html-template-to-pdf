# html-template-to-pdf
Cross-platform library that converts a html file into a pdf. 

# Installation
```
npm install html-template-to-pdf
```

# Usage
Here is an example of how to generate a pdf from `index.html`.

```javascript
const fs = require("fs");
const generatePDF = require("html-template-to-pdf");

async function main() {
    const arrayBuffer = await generatePDF("index.html");    
    const fileStream = fs.createWriteStream("output.pdf");
    fileStream.write(Buffer.from(arrayBuffer));
    fileStream.end();
}

main();
```

# Templating
### Replacing placeholders
The library allows you to use templating to generate dynamic pdfs. It uses the second argument of the `generatePDF` function. Here is an example of how to use it.

```javascript
const fs = require("fs");
const generatePDF = require("html-template-to-pdf");

async function main() {
    const arrayBuffer = await generatePDF("index.html", { str: "World!" });    
    const fileStream = fs.createWriteStream("output.pdf");
    fileStream.write(Buffer.from(arrayBuffer));
    fileStream.end();
}

main();
```

The HTML file `index.html` should look like this.

```html
<p> Hello { str } </p>
```

The output pdf will look like this:
```
Hello World!
```


# Pseudo conditional templating
### Conditionally showing elements
You can also use pseudo conditional templating to hide or show elements. Here is an example of how to use it.

```javascript
const fs = require("fs");
const generatePDF = require("html-template-to-pdf");

async function main() {
    /* 
    **  When str is set, the element will be shown.
    */
    const arrayBuffer = await generatePDF("index.html", { show: true });    
    const fileStream = fs.createWriteStream("output.pdf");
    fileStream.write(Buffer.from(arrayBuffer));
    fileStream.end();
}

main();
```

The HTML file `index.html` should look like this.

```html
<p> Hello ?{str World! }? </p>
```

The output pdf will look like this:
```
Hello World!
```

If `{ show: true }` is not passed to the `generatePDF` function, the output pdf will look like this:
```
Hello
```
<i>Note: setting `{ show: false }` will not make the element disappear. Only removing the key and value from the object will make a difference. In this example, setting `{ show: false }` would still cause the element to appear.</i>