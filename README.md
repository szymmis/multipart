# ⚙️ @szymmis/multipart

> multipart/form-data parsing middleware for @expressjs

[![bundle-size](https://img.shields.io/bundlephobia/minzip/vite-express)](https://www.npmjs.org/package/vite-express)
[![downloads-per-week](https://img.shields.io/npm/dt/@szymmis/multipart?color=success)](https://www.npmjs.org/package/@szymmis/multipart)
[![npm](https://img.shields.io/npm/v/@szymmis/multipart?color=purple)](https://www.npmjs.org/package/@szymmis/multipart)

## ✨ Key features

- Written entirerly in **TypeScript** so typings included
- Works with **CommonJS** and **ESModules** import syntax
- Tests covering all use-cases
- `express` is **the only** run-time dependencies
- Only **~1kB** in size when gzipped

## 💬 Introduction

You shouldn't have to spend half a day configuring and going through docs when all you want to do is to handle files received on request. That's why with `@szymmis/multipart` all you have to write is:

```ts
//server.ts
import express from "express";
import multipart from "@szymmis/multipart"

const app = express();
app.use(multipart());

app.post("/upload", (req, res) => {
  console.log(req.fields);
  console.log(req.files);
})
```

We are only parsing requests with `Content-Type` header set to `multipart/form-data`. The only internal dependency is the `express.raw()` middldeware for parsing body into raw data.

## 📦 Installation and usage

- Install the package with your favourite package manager\
   ***`yarn add @szymmis/multipart`***\
  *`npm install @szymmis/multipart`*

- Import and register as a middleware

```ts
//server.ts
import express from "express";
import multipart from "@szymmis/multipart"

const app = express();
app.use(multipart());
```

- Use request object populated with **fields** and **files**

```ts
//server.ts
import express from "express";
import multipart from "@szymmis/multipart"

const app = express();
app.use(multipart());

app.post("/upload", (req, res) => {
  console.log(req.fields);
  //Example output:
  {
    name: "Jogn",
    surname: "Doe",
    age: "32"
  }

  console.log(req.files);
  //Example output:
  {
    file: {
      filename: "file.txt",
      extension: "txt",
      type: "text/plain"
      data: <Buffer ...>
    }
  }
})
```

### ⚠️ **Note** ⚠️

The **`Content-Type`** header of the request must be in form of\
**`Content-Type: multipart/form-data; boundary=...`** for this middleware to work.\
Such *`Content-Type`* is set automatically when
you submit your **form** on the **front-end** or when you set the *`body`* of your request as a [**`FormData`**](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

Example of **front-end** code for sending *`FormData`* over the fetch request

```js
const form = document.querySelector("#form-id");
form.onsubmit = (e) => {
  e.preventDefault(); // prevent page reload on submit
  const fd = new FormData(form);
  fetch("http://localhost:3000/upload", { method: "POST", body: fd });
};
```

Remember that FormData needs to be sent over POST request

## 🔧 Options

You can specify options object when registering the middleware

```js
  app.use(multipart({ /*Your options go here */ }));
  // e.g.
  app.use(multipart({ limit: "50mb" }))
```

### Available options

| *name* | *description* | *default* | *valid values* | *example value* |
| ---- | ----------- | ------- | ------------ | ----- |
| limit | Maximum payload size | `"10mb"` | `"{number}kb/mb"` | `"50mb"`

## 📝 Documentation

### req.fields`:Record<string, string>`

An object containing all non-file form fields values from inputs of type text, number, etc.

```js
    console.log(req.fields)
    // Example output:
    {
        name: "John",
        surname: "Doe",
        age: "32"
    }
```

### req.files `:Record<string, FormDataFile>`

A dictionary of all the file form fields in form

```js
    console.log(req.files)
    // Example output:
    {
        invoice: {
            filename: "my_invoice.pdf",
            extension: "pdf",
            type: "application/pdf",
            data: <Buffer ...>
        }
    }
```

Each file is an object of type **`FormDataFile`** \
It holds all the needed information about the sent file:

- filename
- extension
- type - [MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) type
- data - Node.js [Buffer](https://nodejs.org/api/buffer.html) containg raw data

```ts
interface FormDataFile {
  filename: string; // (e.g. "logs.txt")
  extension: string; // (e.g. "txt")
  type: string; // (e.g. "text/plain")
  data: Buffer; // (e.g. <Buffer ...>)
}
```

When incoming file was in text form you can easily transform it into string using `Buffer.toString()`

```ts
const { file } = req.files;
console.log(file?.data.toString());
```

You can also easily save the file on a disk using `fs` node module and `writeFile` or `writeFileSync` methods

```ts
const fs = require("fs");
//...
app.post("/", (req, res) => {
  fs.writeFileSync("my_file.txt", req.files.my_file.data);
  //...do anything else
});
```

## 🏦 License

[MIT](https://github.com/szymmis/multipart/blob/master/LICENSE)

## 🖥️ Credits

All credits to me
[@szymmis](https://github.com/szymmis)
