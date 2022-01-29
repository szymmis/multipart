import express from "express";

declare global {
  namespace Express {
    export interface Request {
      files?: any;
      fields?: any;
    }
  }
}

export default function () {
  return function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (req.headers["content-type"]?.includes("multipart/form-data")) {
      //Container of all parsed files
      req.files = {};
      req.fields = {};
      //Get raw-data parsed by express.raw() middleware in form of array of bytes called Buffer
      const buff: Buffer = req.body;
      //This variable will contain buffer offset where the file starts beginning from Webkit...
      let beginIndex = 0;
      //This viariable will hold buffer offset where the file "header" ends
      //if you add 1 to this index you'll get data offset
      let endIndex = 0;
      //We cycle through every byte of data
      buff.forEach((e, i) => {
        //We check for ------ in this byte stream, so i must be greater or equal to 5 so we dont go into negative indexes
        if (i >= 5) {
          //if the current character is '-'
          if (e == 45) {
            //We check if the previous ones were also '-' because we need to have "-------" six dashes
            //followed by Webkit... to know that this is a file header
            if (
              buff.readUInt8(i - 1) == 45 &&
              buff.readUInt8(i - 2) == 45 &&
              buff.readUInt8(i - 3) == 45 &&
              buff.readUInt8(i - 4) == 45 &&
              buff.readUInt8(i - 5) == 45
            ) {
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
                const contentDisposition = meta[1].split('"');
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
                  meta.length > 2 ? meta[2].split(":")[1].trim() : "";
                //File data, we start at endIndex + 1 becouse endIndex is the place where the header info ends
                //so the next index is the first index of the data
                const data = buff.slice(endIndex + 1, i - 5);

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
            //If the char is \n
          } else if (e == 10) {
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
          }
        }
      });
    }
    next();
  };
}
