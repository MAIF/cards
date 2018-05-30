const googleTranslate = require('google-translate')(process.env.GOOGLE_TRANSLATE_KEY);
const fs = require('fs-extra');

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
  return new Promise((success, failure) => {
    googleTranslate.translate(text, lang, (err, translation) => {
      if (err) {
        failure(err);
      } else {
        success(translation.translatedText);
      }
    });
  });
  
}

function translateAll(lang, card) {
  return Promise.all(
    translateOne(card.title),
    Promise.all(
      card.abstract.map(i => translateOne(i))
    ),
    Promise.all(
      card.details.map(i => translateOne(i))
    )
  )
}

function translateCard(lang, tasks) {
  const card = tasks.pop();
  if (!card) return;
  let path = `./src/cards/${card.category}/${card.id}.json`;
  if (card.fr.details.length === 0 && card.fr.abstract.length === 0) {
    path = `./src/cards/${card.category}/title.json`;
  }
  const newCard = { ...card };
  newCard.lang[lang] = {
    title: '',
    abstract: [],
    details: [],
  }

  translateAll(lang, card).then(translated => {
    newCard.lang[lang].title = translated[0];
    newCard.lang[lang].abstract = translated[1];
    newCard.lang[lang].details = translated[2];
    const code = JSON.stringify(newCard, null, 2);
    fs.outputFileSync(path, code);
    setTimeout(() => translateCard(lang, tasks));
  });
}

translateCard('en', [...allCards]);
//translateCard('de', [...allCards]);
//translateCard('es', [...allCards]);