import express from "express";

interface MultipartOptions {
  limit: `${number}${"kb" | "mb"}`;
}

interface FormDataFile {
  filename: string;
  extension: string;
  type: string;
  data: Buffer;
}

declare global {
  namespace Express {
    export interface Request {
      files: Record<string, FormDataFile>;
      fields: Record<string, string>;
    }
  }
}

function isBoundary(boundary: number[], buff: Buffer, index: number) {
  if (index < boundary.length) return false;
  for (let i = 0; i < boundary.length; i++) {
    if (boundary[boundary.length - (i + 1)] !== buff.readUInt8(index - i))
      return false;
  }
  return true;
}

export = function (options?: MultipartOptions) {
  return function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    express.raw({
      type: "multipart/form-data",
      limit: options?.limit ?? "10mb",
    })(req, res, () => {
      req.files = {};
      req.fields = {};
      const contentType = req.headers?.["content-type"];
      if (contentType?.match(/multipart\/form-data/)) {
        const boundary = contentType
          .replace(/.*boundary=([\w-]+)/, "$1")
          .split("")
          .map((letter) => letter.charCodeAt(0));
        //Container of all parsed files
        //Get raw-data parsed by express.raw() middleware in form of array of bytes called Buffer
        if (!(req?.body instanceof Buffer)) return next();
        const buff: Buffer = req.body;

        //This variable will contain buffer offset where the file starts beginning from Webkit...
        let beginIndex = 0;
        //This viariable will hold buffer offset where the file "header" ends
        //if you add 1 to this index you'll get data offset
        let endIndex = 0;
        //We cycle through every byte of data
        buff.forEach((e, i) => {
          //If the char is \n
          if (e == 10) {
            //We check if we've just encountered another \n before
            //we do that because in the raw data file when the data starts we have double \r\n right before it
            if (buff.readUInt8(i - 2) == 10) {
              //We want only the first encounter of \r\n to save, becouse the data itself can have this combination of values
              //so we dont wan't to mess it up by taking wrong header ending index
              if (beginIndex != 0) {
                if (endIndex == 0) {
                  endIndex = i;
                }
              }
            }
          } else {
            if (isBoundary(boundary, buff, i)) {
              //If we encounter -------Webkit... when we already have, that means that we
              //encountered an end of file block so we write it to files object
              if (beginIndex > 0) {
                //This extracts a "meta" info from the buffer data chunk
                //We can then extract the filename, filed-name etc.
                const meta = buff
                  .slice(beginIndex, endIndex)
                  .toString()
                  .replace(/\r/g, "")
                  .trim()
                  .split("\n");

                //Split Content-Disposition header line into tokens in which index 1 is name= and index 3 is filename=
                const contentDisposition = meta[0].split('"');
                //Name of the field that was send in multipart-form
                const name = contentDisposition[1];
                //Original filename that was send in the form
                const filename = contentDisposition[2].includes("filename")
                  ? contentDisposition[3]
                  : undefined;
                //Extranct the extension
                const extension =
                  filename && filename.includes(".")
                    ? filename.slice(
                        filename.lastIndexOf(".") + 1,
                        filename.length
                      )
                    : "";
                //Content-Type that the file was send with
                const type =
                  meta.length > 1 ? meta[1].split(":")[1].trim() : "";

                const data = buff.slice(
                  endIndex + 1,
                  i - boundary.length - "--".length
                );

                //Push the file to the object
                if (filename != undefined) {
                  req.files[name] = {
                    filename,
                    extension,
                    type,
                    data,
                  };
                } else {
                  req.fields[name] = data.toString().trim();
                }
              }

              //Set the begining point of the header to this index
              beginIndex = i + 1;
              //and clear endindex so we know that we havent encountered it yet
              //by end of the header I mean double \r\n
              endIndex = 0;
            }
          }
        });
      }

      next();
    });
  };
};
