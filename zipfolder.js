var fs = require('fs');
var archiver = require('archiver');
var path = require('path');
const ignore = require('ignore');
const glob = require('glob');

// joins the given path segments together using the platform-specific delimiter
// __dirname global variable in Node.js is the name of the directory 
// that contains the JavaScript source code file that is currently executing.
const directoryToZip = path.join(__dirname, 'myfolder');
const outputFilename = path.join(__dirname, 'output.zip');

async function zipDirectory(source, out) {
    var output = fs.createWriteStream(out);
    var archive = archiver('zip', { zlib: { level: 9 } }); // Sets the compression level.

    const ig = ignore();
    try {
        const gitignoreContent = fs.readFileSync(path.join(source, '.gitignore'), 'utf8');
        ig.add(gitignoreContent.split('\n').map(line => line.trim()));
    } catch (err) {
        console.warn('No .gitignore file found or error reading .gitignore. All files will be included.');
    }
    const files = glob.sync('**/*', { cwd: source, dot: true, nodir: false, ignore: ['**/node_modules/**', '**/.git/**'] });

    const filesToZip = files.filter(file =>
        {
            const relativePath = file.replace(/\\/g, '/');
            return !ig.ignores(relativePath);
        }
    );
   
    filesToZip.forEach(file => {
        const filePath = path.join(source, file);
        if (fs.statSync(filePath).isFile()) {
            archive.file(filePath, { name: file });
        }
    });

    return new Promise((resolve, reject) => {
        archive.on('error', err => reject(err));
        output.on('close', () => resolve());
        archive.pipe(output);
        archive.finalize();
    });

}

// Call the function with your specific folder and output file
zipDirectory('../sumos', 'sumosoutput.zip')
    .then(() => console.log('Directory successfully zipped!'))
    .catch(err => console.error(err));
