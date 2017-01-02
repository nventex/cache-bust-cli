let cheerio = require("cheerio"),
    fs = require("fs"),
    path = require("path"),
    readdirSync = require("./readdir-recursive");

let args = process.argv.slice(2);

let configFile = fs.readFileSync(args[0], "utf8");

let config = JSON.parse(configFile);

readPaths();

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

    var files = readdirSync(paths, file => path.extname(file) === config.filter);

    if (!files || files.length === 0) {
        throw "Did not find any files to bust!";
    }

    files.forEach(file => bust(file));
}