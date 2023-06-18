var fs = require('fs');
var archiver = require('archiver');
var path = require('path');

// joins the given path segments together using the platform-specific delimiter
// __dirname global variable in Node.js is the name of the directory 
// that contains the JavaScript source code file that is currently executing.
const directoryToZip = path.join(__dirname, 'myfolder');
const outputFilename = path.join(__dirname, 'output.zip');

function zipDirectory(source, out) {
    var output = fs.createWriteStream(out);
    var archive = archiver('zip', { zlib: { level: 9 } }); // Sets the compression level.

    return new Promise((resolve, reject) => {
        archive.directory(source, false)
            .on('error', err => reject(err))
            .pipe(output);

        output.on('close', () => resolve());
        archive.finalize();
    });
}

// Call the function with your specific folder and output file
zipDirectory('../sumos', 'sumosoutput.zip')
    .then(() => console.log('Directory successfully zipped!'))
    .catch(err => console.error(err));
