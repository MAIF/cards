const Translate = require('@google-cloud/translate'); // require('google-translate')('AIzaSyAdDBFXWwFc4j59PXXj2ePOtnLBPUp_Nnw') //(process.env.GOOGLE_TRANSLATE_KEY);
const fs = require('fs-extra');

const translate = new Translate({
  projectId: process.env.GOOGLE_TRANSLATE_PROJECT
});

const langs = require('./cards/lang.json');
const categories = {
  'time-to-market': require(`./cards/time-to-market/metadata.json`).cards.map(id => require(`./cards/time-to-market/${id}.json`)),
  'user-experience': require(`./cards/user-experience/metadata.json`).cards.map(id => require(`./cards/user-experience/${id}.json`)),
  'human': require(`./cards/human/metadata.json`).cards.map(id => require(`./cards/human/${id}.json`)),
  'interoperability': require(`./cards/interoperability/metadata.json`).cards.map(id => require(`./cards/interoperability/${id}.json`)),
  'rules': require(`./cards/rules/metadata.json`).cards.map(id => require(`./cards/rules/${id}.json`))
};
const allCards = [
  ...categories['time-to-market'],
  ...categories['user-experience'],
  ...categories.human,
  ...categories.interoperability,
  ...categories.rules
];

function translateOne(lang, text) {
  return translate.translate(text, lang).then(r => {
    return r[0]
  }); 
}

function translateAll(lang, card) {
  return Promise.all([
    translateOne(lang, card.lang.fr.title),
    Promise.all(
      card.lang.fr.abstract.map(i => translateOne(lang, i))
    ),
    Promise.all(
      card.lang.fr.details.map(i => translateOne(lang, i))
    )
  ])
}

function translateAllRoot(lang, root) {
  return Promise.all([
    translateOne(lang, root.menu.allCards),
    translateOne(lang, root.menu.card),
    translateOne(lang, root.menu.search),
    translateOne(lang, root.menu.cardsOf),
    translateOne(lang, root.tooltips.newCard),
    translateOne(lang, root.tooltips.help),
  ])
}

function translateCard(lang, tasks) {
  const card = tasks.pop();
  if (!card) return;
  let path = `./src/cards/${card.category}/${card.id}.json`;
  if (card.lang.fr.details.length === 0 && card.lang.fr.abstract.length === 0) {
    path = `./src/cards/${card.category}/title.json`;
  }
  const newCard = { ...card };
  newCard.lang[lang] = {
    title: '',
    abstract: [],
    details: [],
  };
  translateAll(lang, card).then(translated => {
    newCard.lang[lang].title = translated[0];
    newCard.lang[lang].abstract = translated[1];
    newCard.lang[lang].details = translated[2];
    const code = JSON.stringify(newCard, null, 2);
    fs.outputFileSync(path, code);
    console.log(code)
    setTimeout(() => translateCard(lang, tasks));
  }, e => console.log(e));
}

function translateRoot(lang) {
  const fr = langs.filter(l => l.lang === 'fr')[0];
  const newLang = {
    "lang": lang,
    "menu": {
      "allCards": "",
      "card": "",
      "search": "",
      "cardsOf": ""
    },
    "tooltips": {
      "newCard": "",
      "help": ""
    }
  };
  translateAllRoot(lang, fr).then(res => {
    newLang.menu.allCards = res[0];
    newLang.menu.card = res[1];
    newLang.menu.search = res[2];
    newLang.menu.cardsOf = res[3];
    newLang.tooltips.newCard = res[4];
    newLang.tooltips.help = res[5];
    const newLangs = [...langs, newLang];
    const code = JSON.stringify(newLangs, null, 2);
    fs.outputFileSync('./src/cards/lang.json', code);
    console.log(code)
  }, e => console.log(e));
  
}

// translateCard('en', [...allCards]);
// translateRoot('en');
// translateCard('de', [...allCards]);
// translateRoot('de');
// translateCard('es', [...allCards]);
// translateRoot('es');
// translateCard('zh-CN', [...allCards]);
// translateRoot('zh-CN');
// translateCard('ja', [...allCards]);
// translateRoot('ja');
// translateCard('ru', [...allCards]);
// translateRoot('ru');
// translateCard('ar', [...allCards]);
// translateRoot('ar');