# html-template-to-pdf
Cross-platform library that converts a html file into a pdf. 

Take a look at  [`html-pdf-node package`](https://github.com/mrafiqk/html-pdf-node) for additional pdf generation options.

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
    **  When `show` is true, the element will be shown.
    **  When `show` is false, the element will be hidden.
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
<p> Hello ?{show World! }? </p>
```

The output pdf will look like this:
```
Hello World!
```

Or if `show` is false, the output pdf will look like this:
```
Hello
```

# Example
```javascript
const fs = require("fs");
const generatePDF = require("html-template-to-pdf");

async function main() {
    const arrayBuffer = await generatePDF("index.html", {
        employeeName: "John Doe",
        salary: "$9000",
        show: true
    });    
    const fileStream = fs.createWriteStream("output.pdf");
    fileStream.write(Buffer.from(arrayBuffer));
    fileStream.end();
}

main();
```

```html
<!-- The div will only be visible if `show` is set -->
?{show
<div>
    <p> Hello, { employeeName } </p>

    <!-- The paragraph will be shown if `salary` is set. Note that `salary` can be of any type: Boolean, Number, Float, String, ...  -->
    ?{salary
    <p> Your salary is { salary } </p>
    }?
</div>
}?
```

Would generate:
```
Hello, John Doe
Your salary is $9000
```