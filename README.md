# Simple multipart/form-data express.js middleware

## Introduction

This package is very simple parsing middleware for express.
It parses incoming formdata into `req.fields` and `req.files` objects

Why this package? It's very easy in use:

- You just install the package and import it
- Use it as a middleware with `app.use()`
- Your `fields` and `files` are ready to use in your routes `request` object
- Works with CommonJS as well as ESModules!
- Written in TypeScript, types included!

## Installation and usage

- Install the package with - `yarn add @szymmis/multipart`
- Import it into your app - `const multipart = require("@szymmis/multipart")` or `import multipart from "@szymmis/multipart"`
- And simply use your data

```js
//importing express, creating app object etc...
//...

const multipart = require("@szymmis/multipart");
app.use(multipart());

app.post("/", (req, res) => {
  console.log(req.files); // Dictionary of all sent files
  console.log(req.fields); // Dictionary of all text/number/etc fields
});
```

## Documentation

### req.files `:Record<string, FormDataFile>`

Object of all files in form of pairs `input_name: FormDataFile`

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

### `FormDataFile`

```js
interface FormDataFile {
  filename: string; //uplodaed file name (ex: "logs.txt")
  extension: string; //uploaded file extension (ex: "txt")
  type: string; //uploaded file type as in MIME Type (ex: "text/plain")
  data: Buffer; //Node.js byte data buffer
}
```

### req.fields `:Record<string, string>`

Object of all simple fields in pairs of `input_name: value`

```js
    {
        name: "John",
        surname: "Doe",
        age: "23"
    }
```

## License

This package is distributed under the [GNU General Public License Version 2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html).

## Credits

All credits to me
[@szymmis](https://github.com/szymmis)
