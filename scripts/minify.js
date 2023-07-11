import { minify } from "terser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDirname = path.dirname(__dirname);

function getAllFiles(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(parentDirname, dirPath, "/", file));
    }
  });

  return arrayOfFiles.filter((path) => path.match(/\.js$/));
}

function minifyFiles(filePaths) {
  filePaths.forEach(async (filePath) => {
    const { code } = await minify(fs.readFileSync(filePath, "utf8"));
    fs.writeFileSync(filePath, code);
  });
}

const files = getAllFiles("./dist");
minifyFiles(files);
