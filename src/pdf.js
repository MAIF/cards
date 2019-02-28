const fs = require('fs');
const { fork, exec } = require('child_process');
const RenderPDF = require('chrome-headless-render-pdf');

const langs = [
  'fr',
  'ar',
  'de',
  'en',
  'es',
  'ja',
  'ru',
  'zh-CN'
];

const process = fork('./src/server.js', []);
setTimeout(() => {
  fs.mkdirSync('./docs/pdfs');
  Promise.all(langs.map(lang => {
    return RenderPDF.generateSinglePdf(`http://127.0.0.1:3001/cards/${lang}/all.html`, `./docs/pdfs/cards-${lang}.pdf`, {
      paperWidth: 3.346,
      paperHeight: 4.627,
      noMargins: true
    });
  })).then(() => {
    process.kill();
  });
}, 600);


