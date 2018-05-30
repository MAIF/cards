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

  googleTranslate.translate(card.title, lang, (err, translation) => {
    newCard.lang[lang].title = translation.translatedText;
    setTimeout(() => translateCard(lang, tasks));
  });
}

translateCard('en', [...allCards]);
translateCard('de', [...allCards]);
translateCard('es', [...allCards]);