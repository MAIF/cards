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

function ooops(tasks) {
  const card = tasks.pop();
  if (!card) return;
  let path = `./src/cards/${card.category}/${card.id}.json`;
  if (card.lang.fr.details.length === 0 && card.lang.fr.abstract.length === 0) {
    path = `./src/cards/${card.category}/title.json`;
  }
  const code = JSON.stringify(card, null, 2).replace(/(\*\*.*?) \*\*/g, '$1**');
  fs.outputFileSync(path, code);
}

ooops([...allCards]);
