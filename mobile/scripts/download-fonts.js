const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '..', 'assets', 'fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = {
  'Mukta-Regular.ttf': 'https://github.com/google/fonts/raw/main/ofl/mukta/Mukta-Regular.ttf',
  'Mukta-Medium.ttf': 'https://github.com/google/fonts/raw/main/ofl/mukta/Mukta-Medium.ttf',
  'Mukta-SemiBold.ttf': 'https://github.com/google/fonts/raw/main/ofl/mukta/Mukta-SemiBold.ttf',
  'Mukta-Bold.ttf': 'https://github.com/google/fonts/raw/main/ofl/mukta/Mukta-Bold.ttf',
  'Mukta-ExtraBold.ttf': 'https://github.com/google/fonts/raw/main/ofl/mukta/Mukta-ExtraBold.ttf',
  'CrimsonPro-Italic.ttf': 'https://github.com/google/fonts/raw/main/ofl/crimsonpro/static/CrimsonPro-Italic.ttf',
  'SpaceMono-Regular.ttf': 'https://github.com/google/fonts/raw/main/ofl/spacemono/SpaceMono-Regular.ttf',
  'SpaceMono-Bold.ttf': 'https://github.com/google/fonts/raw/main/ofl/spacemono/SpaceMono-Bold.ttf'
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading fonts to', fontsDir);
  for (const [name, url] of Object.entries(fonts)) {
    const dest = path.join(fontsDir, name);
    try {
      await downloadFile(url, dest);
    } catch (e) {
      console.error(`Failed to download ${name}:`, e.message);
    }
  }
  console.log('Fonts download process completed.');
}

main();
