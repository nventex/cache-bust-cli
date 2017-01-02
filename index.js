let cheerio = require("cheerio"),
    fs = require("fs"),
    path = require("path");

let args = process.argv.slice(2);

let configFile = fs.readFileSync(args[0], "utf8");

let config = JSON.parse(configFile);

let hadBustedFile = false;

readPaths();

if (!hadBustedFile) {
    throw "Did not find any files to bust!";
}

function bust(bustFile) {
    let file = fs.readFile(bustFile, "utf8", (err, data) => {
        if (err) {
            throw err;
        }

        let $ = cheerio.load(data),
                elements = $('script[src], link[rel=stylesheet][href]'),
                elementTypes = { script: "src", link: "href" };

        elements.map((i) => {
            let element = elements[i],
                attribute = elementTypes[element.name];

            data = data.replace(`${element.attribs[attribute]}`, `${element.attribs[attribute]}?${Date.now()}`);
        });

        fs.writeFile(bustFile, data);
    });
}

function readPaths() {
    let paths = config.paths;

    paths.forEach(directory => {
        var files = fs.readdirSync(directory);
        
        bustFiles(files, directory);
    });
}

function bustFiles(files, directory) {
    files.forEach(file => {
        var bustFile = path.join(directory, file);

        if (path.extname(bustFile) !== config.filter) {
            return;
        };

        var stats = fs.statSync(bustFile);

        if (!stats.isDirectory()) {
            hadBustedFile = true;
            bust(bustFile);
        }
    })
}