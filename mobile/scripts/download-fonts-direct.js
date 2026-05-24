const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '..', 'assets', 'fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// Using direct raw.githubusercontent.com URLs to avoid redirects completely
const fonts = {
  'Mukta-Regular.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/mukta/Mukta-Regular.ttf',
  'Mukta-Medium.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/mukta/Mukta-Medium.ttf',
  'Mukta-SemiBold.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/mukta/Mukta-SemiBold.ttf',
  'Mukta-Bold.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/mukta/Mukta-Bold.ttf',
  'Mukta-ExtraBold.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/mukta/Mukta-ExtraBold.ttf',
  'CrimsonPro-Italic.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/crimsonpro/CrimsonPro-Italic%5Bwght%5D.ttf',
  'SpaceMono-Regular.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/SpaceMono-Regular.ttf',
  'SpaceMono-Bold.ttf': 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacemono/SpaceMono-Bold.ttf'
};

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (Status Code: ${response.statusCode})`));
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading fonts directly to', fontsDir);
  for (const [name, url] of Object.entries(fonts)) {
    const dest = path.join(fontsDir, name);
    try {
      // Delete old file if exists
      if (fs.existsSync(dest)) {
        fs.unlinkSync(dest);
      }
      await downloadFile(url, dest);
    } catch (e) {
      console.error(`Failed to download ${name}:`, e.message);
    }
  }
  console.log('Fonts download completed.');
}

main();
