const fs = require('fs');
const { fork, exec } = require('child_process');
const RenderPDF = require('chrome-headless-render-pdf');

const langs = [
  'ar',
  'de',
  'en',
  'es',
  'fr',
  'ja',
  'ru',
  'zh-CN'
];

const process = fork('./src/server.js', []);
setTimeout(() => {
  fs.mkdirSync('./docs/pdfs');
  Promise.all(langs.map(lang => {
    return RenderPDF.generateSinglePdf(`http://127.0.0.1:3001/cards/${lang}/all.html`, `./docs/pdfs/cards-${lang}.pdf`);
  })).then(() => {
    process.kill();
  });
}, 600);


