let fs = require("fs")
    path = require("path");

var files, directories;

function readdirRecursive(rootDirectories, predicate) {
   files = [], directories = [];

   readDirectory(rootDirectories);

   getFilesToBust(predicate);

   return files;
}

function readDirectory(fileObjects) {
    
    if (fileObjects.length === 0) {
        return;
    }
    
    var objectsToRead = [];

    fileObjects.forEach(fileObject => {
        var stat = fs.statSync(fileObject);
        if (stat.isDirectory() && directories.indexOf(fileObject) === -1) {
            objectsToRead = objectsToRead.concat(fs.readdirSync(fileObject).map(x => path.join(fileObject, x)));
            directories.push(fileObject);
        }
    });

    readDirectory(objectsToRead);
}

function getFilesToBust(predicate) {
    directories.forEach(directory => {
        files = files.concat(fs.readdirSync(directory).filter(x => predicate(path.join(directory, x))).map(y => path.join(directory, y)));
    })
}

module.exports = readdirRecursive;