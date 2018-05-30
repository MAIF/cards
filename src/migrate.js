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

allCards.forEach(card => {
  const path = `./cards/${card.category}/${card.id}.json`;
  const newCard = { ...card };
  newCard.lang = {
    fr: {
      title: card.title,
      abstract: card.abstract,
      details: card.details,
    }
  }
  delete newCard.title;
  delete newCard.abstract;
  delete newCard.details;
  const code = JSON.stringify(newCard, null, 2);
  fs.outputFile(path, 'code!', err => {
    if (err) {
      console.log('[KO] ' + path)
      console.log(err) // => null
    } else {
      console.log('[OK] ' + path)
    }
  })
  
  console.log(code);
});