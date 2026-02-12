const https = require('https');
const fs = require('fs');
const path = require('path');

const url = "https://raw.githubusercontent.com/datameet/maps/master/Country/india-soi.geojson";
const outputPath = path.join(__dirname, '..', 'public', 'india-official.json');

console.log(`Starting download from: ${url}`);
console.log(`Target path: ${outputPath}`);

const file = fs.createWriteStream(outputPath);

https.get(url, (response) => {
    console.log(`Response status: ${response.statusCode}`);
    if (response.statusCode !== 200) {
        console.error(`Download failed with status code ${response.statusCode}`);
        process.exit(1);
    }

    response.pipe(file);

    file.on('finish', () => {
        file.close();
        console.log('SUCCESS: File saved to public/india-official.json');
        const stats = fs.statSync(outputPath);
        console.log(`File size: ${stats.size} bytes`);
        process.exit(0);
    });
}).on('error', (err) => {
    console.error(`Network error: ${err.message}`);
    fs.unlink(outputPath, () => { });
    process.exit(1);
});
