import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public', 'fonts');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

const download = (url, dest) => {
    const file = fs.createWriteStream(dest);
    https.get(url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => console.log(`Downloaded ${dest}`));
        });
    }).on('error', function (err) {
        fs.unlink(dest);
        console.error(`Error downloading ${url}:`, err.message);
    });
};

download('https://github.com/google/fonts/raw/main/ofl/hind/Hind-Regular.ttf', path.join(publicDir, 'Hind-Regular.ttf'));
download('https://github.com/google/fonts/raw/main/ofl/hind/Hind-Bold.ttf', path.join(publicDir, 'Hind-Bold.ttf'));
