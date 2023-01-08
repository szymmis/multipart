# ⚙️ @szymmis/multipart

> multipart/form-data parsing middleware for @expressjs

[![bundle-size](https://img.shields.io/bundlephobia/min/@szymmis/multipart)][npm-link]
[![downloads-per-week](https://img.shields.io/npm/dt/@szymmis/multipart?color=success)][npm-link]
[![npm](https://img.shields.io/npm/v/@szymmis/multipart?color=purple)][npm-link]

## ✨ Key features

- Written in **TypeScript**
- Works with **CommonJS** and **ESModules** import syntax
- **Tests** written for all use cases
- `express` is **the only** runtime dependencies
- Only **~1kB** in size when minified

## 💬 Introduction

Using `express` middleware for transforming json or parsing cookies is super easy and requires minimal configuration, so why parsing `multipart/form-data` should be different? Plug in the middleware and let it handle the request, while all you have to do is to utilize `Request` param populated with `fields` and `files` from the request.

```js
//server.js
const express = require("express");
const multipart = require("@szymmis/multipart");

const app = express();
app.use(multipart());

app.post("/upload", (req, res) => {
  console.log(req.fields);
  console.log(req.files);
});
```

Perfect, when all you want is to have form data parsed in a convenient form, without unnecessary disk saves, e.g. parsing CSV sent over the network and sending JSON back. No redundant calls as the parser runs only when the `Content-Type` header's value is set to `multipart/form-data`.

## 📦 Installation and usage

- Install the package with your favorite package manager

```console
 $ yarn add @szymmis/multipart
```

- Import and register as a middleware

```ts
//server.ts
import express from "express";
import multipart from "@szymmis/multipart";

const app = express();
app.use(multipart());
```

- Utilize request object populated with **fields** and **files**

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
    name: "John",
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
Such _`Content-Type`_ is set automatically when
you submit your **form** on the **front-end** or when you set the _`body`_ of your request as a [**`FormData`**][form-data]

Example of **front-end** code for sending _`FormData`_ over the fetch request

```js
const form = document.querySelector("#form-id");
form.onsubmit = (e) => {
  e.preventDefault(); // prevent page reload on submit
  const fd = new FormData(form);
  fetch("http://localhost:3000/upload", { method: "POST", body: fd });
};
```

## 🔧 Options

| _name_ | _description_        | _default_ | _valid values_  | _example value_ |
| ------ | -------------------- | --------- | --------------- | --------------- |
| limit  | Maximum payload size | `10mb`    | `{number}kb/mb` | `50mb`          |

You can specify options object when registering the middleware

```js
app.use(
  multipart({
    /*Your options go here */
  })
);
```

For example:

```js
app.use(multipart({ limit: "50mb" }));
```

## 📝 Documentation

### `req.fields: Record<string, string>`

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

### `req.files: Record<string, FormDataFile>`

A dictionary of all the `type="file"` fields in form

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

Where each file is an object of type **`FormDataFile`**

```ts
interface FormDataFile {
  filename: string;
  extension: string;
  type: string;
  data: <Buffer ...>;
}
```

| field     | description                                           | example        |
| --------- | ----------------------------------------------------- | -------------- |
| filename  | Uploaded file's name                                  | data.txt       |
| extension | Uploaded file's extension                             | txt            |
| type      | [MIME type][mime-types]                               | text/plain     |
| data      | Node.js [Buffer][buffer] containing raw data as bytes | `<Buffer ...>` |

### 🤔 Buffer containing what?

You can easily transform Buffer into string using its `toString()` method

```ts
const { file } = req.files;
console.log(file?.data.toString());
```

Or save the file onto the disk using node `fs` module

```ts
const fs = require("fs");
//...
app.post("/", (req, res) => {
  const { logs } = req.files;
  fs.writeFileSync("output.txt", logs?.data);
  //...
});
```

## 🏦 License

[MIT](https://github.com/szymmis/multipart/blob/master/LICENSE)

## 🖥️ Credits

[@szymmis](https://github.com/szymmis)

[npm-link]: https://www.npmjs.org/package/@szymmis/multipart
[form-data]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
[mime-types]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
[buffer]: https://nodejs.org/api/buffer.html
