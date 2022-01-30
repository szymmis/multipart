# Simple _`multipart/form-data`_ parser

## Introduction

This package is very simple parsing middleware for express. \
It parses incoming formdata into `req.fields` and `req.files` objects

Why **this** package? Because it's very easy in use:

- Install the package and import it
- Use it as a middleware with `app.use()`
- Your `fields` and `files` are ready to use in your routes `request` object
- Works with **CommonJS** as well as **ESModules**!
- Written in **TypeScript**, types included!

## Installation and usage

- Install the package with\
   `yarn add @szymmis/multipart` or `npm install @szymmis/multipart`
- Import it into your app\
  `const multipart = require("@szymmis/multipart")` or `import multipart from "@szymmis/multipart"`
- And simply use your data

```js
//importing express, creating app object etc...
//...
const multipart = require("@szymmis/multipart");

app.use(multipart());

app.post("/", (req, res) => {
  console.log(req.files); // All sent files from your files inputs
  console.log(req.fields); // All other fields from other inputs such as text,number,etc
});
```

### ⚠️ **Note** ⚠️

The `Content-Type` header of the request must be in form of `Content-Type: multipart/form-data; boundary=...` for this middleware to work. Such `Content-Type` is set automatically when
you submit your **form** on the **front-end** or when you set the `body` of your fetch as a `FormData`

Example of **front-end** code for sending `FormData` over the fetch request

```js
const form = document.querySelector("#form-id");
form.onsubmit = (e) => {
  e.preventDefault(); // prevent form from reloading the page on submitting
  const fd = new FormData(form);
  fetch("http://localhost:3000", { body: fd, method: "POST" });
  // remember that FormData needs to be sent over the POST request!
};
```

## Documentation

### req.fields `:Record<string, string>`

All the basic fields are sent to the server in form of pairs of input_name=value
and in such form are served to you. `req.fields` is a object of all the parsed simple
fields.

```js
    console.log(req.fields)
    //Example output:
    {
        name: "John",
        surname: "Doe",
        age: "23"
    }
```

From above example we can deduce that the form had three fields with the
names: `name`, `surname` and `age`

### req.files `:Record<string, FormDataFile>`

All sent files are available in this object in form of pairs `input_name: FormDataFile`\
Example of such file object, where invoice is the name of the **form field** that
this file was sent from

```js
    {
        invoice: {
            filename: "my_invoice.pdf",
            extension: "pdf",
            type: "application/pdf",
            data: <Buffer ...>
        }
    }
```

And each file is an object of type **`FormDataFile`** \
It holds all the needed information about the sent file such as: `filename`, `extension`, `type` and of course raw `data`

```js
interface FormDataFile {
  filename: string; //uplodaed file name (ex: "logs.txt")
  extension: string; //uploaded file extension (ex: "txt")
  type: string; //uploaded file type as in MIME Type (ex: "text/plain")
  data: Buffer; //Node.js byte data buffer
}
```

To see the contents of a file in form of a string, when for example sent file was a simple `.txt` file we can just stringify the `data` field

```js
const { file } = req.files;
console.log(file?.data.toString());
```

We can as well save the file on a disk using `fs` node module and `saveFile` or `saveFileSync` methods

```js
const fs = require("fs");
//...
app.post("/", (req, res) => {
  fs.saveFileSync("./your_path.txt", req.files?.my_file.data);
  res.end(); //always remember end the request in some way to avoid stalling it
});
```

## License

This package is distributed under the [GNU General Public License Version 2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html).

## Credits

All credits to me
[@szymmis](https://github.com/szymmis)
