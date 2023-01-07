import express from "express";
import fs from "fs";
import path from "path";
import request from "supertest";

import multipart from "../src/main";

const app = express();
app.use(multipart());

app.post("/", (req, res) => {
  res.send({ body: req.body, fields: req.fields, files: req.files });
});

describe("multipart/form-data parsing logic", () => {
  it("Parses plain form fields", () => {
    return request(app)
      .post("/")
      .field("name", "John")
      .field("age", "32")
      .expect((res) => {
        const { name, age } = res.body.fields;
        expect(name).toBe("John");
        expect(age).toBe("32");
      });
  });

  it("Has no files when parsing only plain fields", () => {
    return request(app)
      .post("/")
      .field("name", "John")
      .field("age", "32")
      .expect((res) => {
        expect(res.body.files).toStrictEqual({});
      });
  });

  it("Parses file form fields", () => {
    return request(app)
      .post("/")
      .attach("test_file", Buffer.from("Hello world!"), {
        filename: "test.txt",
      })
      .expect((res) => {
        expect(res.body.files.test_file).toBeDefined();
      });
  });

  it("Has no fields when parsing only file fields", () => {
    return request(app)
      .post("/")
      .attach("test_file", Buffer.from("Hello world!"), {
        filename: "test.txt",
      })
      .expect((res) => {
        expect(res.body.fields).toStrictEqual({});
      });
  });

  it("Preserves file's meta info", () => {
    return request(app)
      .post("/")
      .attach("test_file", Buffer.from("Hello world!"), {
        filename: "text.txt",
      })
      .expect((res) => {
        const { test_file } = res.body.files;
        expect(test_file.filename).toBe("text.txt");
        expect(test_file.extension).toBe("txt");
        expect(test_file.type).toBe("text/plain");
      });
  });

  it("Preserves buffer's contents", () => {
    return request(app)
      .post("/")
      .attach("text_file", Buffer.from("Hello world!"), {
        filename: "text.txt",
      })
      .attach("array_file", Buffer.from([1, 1, 2, 3, 5, 8]), {
        filename: "text.txt",
      })
      .expect((res) => {
        const { text_file, array_file } = res.body.files;
        expect(
          Buffer.from(text_file?.data).equals(Buffer.from("Hello world!")),
        ).toBeTruthy();
        expect(
          Buffer.from(array_file?.data).equals(Buffer.from([1, 1, 2, 3, 5, 8])),
        ).toBeTruthy();
      });
  });

  it("Preserves physical file's contents", () => {
    return request(app)
      .post("/")
      .attach("test_file", "README.md")
      .expect((res) => {
        const { test_file } = res.body.files;
        expect(
          Buffer.from(test_file?.data).equals(
            fs.readFileSync(path.join(process.cwd(), "README.md")),
          ),
        ).toBeTruthy();
      });
  });

  it("Ignores requests with inappropriate Content-Type", () => {
    return request(app)
      .post("/")
      .set("Content-Type", "text/plain")
      .expect((res) => {
        expect(res.body.body).toStrictEqual({});
      });
  });

  it("Respects provided limit option", () => {
    const app = express();
    app.use(multipart({ limit: "15mb" }));
    app.post("/", (req, res) => {
      res.send({ fields: req.fields, files: req.files });
    });
    return request(app)
      .post("/")
      .attach("file", Buffer.alloc(1000 ** 2 * 15), { filename: "file.dat" })
      .expect((res) => {
        expect(res.body.files.file).toBeDefined();
      });
  });

  it("Ignores parsing when body bigger than provided limit", () => {
    const app = express();
    app.use(multipart({ limit: "1kb" }));
    app.post("/", (req, res) => {
      res.send({ fields: req.fields, files: req.files });
    });
    return request(app)
      .post("/")
      .attach("file", Buffer.alloc(1000 * 2), { filename: "file.dat" })
      .expect((res) => {
        expect(res.body.files.file).toBeUndefined();
      });
  });
});
