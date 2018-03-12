const showdown = require('showdown');
const rimraf = require('rimraf');
const fs = require('fs-extra');

const target = './docs';
const converter = new showdown.Converter();

const categories = {
  'time-to-market': require(`./cards/time-to-market/metadata.json`).cards.map(id => require(`./cards/time-to-market/${id}.json`)),
  'user-experience': require(`./cards/user-experience/metadata.json`).cards.map(id => require(`./cards/user-experience/${id}.json`)),
  'humain': require(`./cards/humain/metadata.json`).cards.map(id => require(`./cards/humain/${id}.json`)),
  'interoperabilite': require(`./cards/interoperabilite/metadata.json`).cards.map(id => require(`./cards/interoperabilite/${id}.json`)),
  'regles-du-jeu': require(`./cards/regles-du-jeu/metadata.json`).cards.map(id => require(`./cards/regles-du-jeu/${id}.json`))
};

const allCards = [
  ...categories['time-to-market'],
  ...categories['user-experience'],
  ...categories.humain,
  ...categories.interoperabilite,
  ...categories['regles-du-jeu']
];

function rmLastDistribution() {
	return new Promise((success, failure) => {
	  rimraf(target, {}, (err, s) => {
	  	if (err) {
				failure(err);
	  	} else {
				success(s);
	  	}
	  });
	});
  
}

function mkdir(path) {
	fs.mkdirSync(target + '/' + path);
}

function mkdirs() {
	fs.mkdirSync(target);
	Object.keys(categories).forEach(category => {
		mkdir(category);
		mkdir(category + '-golden');
	});
}

function touch(path, content) {
	fs.writeFileSync(path, content);
}

function createIndex(category, card) {
	const template = basePage('Cards', `
	<div class="hide">
		${allCards.map(card => createCardFragment(card)).join('\n')}
	</div>
	<div id="random"></div>
	<div style="width:100%;display:flex;justify-content:center;align-items:center;margin-top:50px;margin-bottom:50px;">
	<button id="random-click" type="button" class="btn btn-success">random card</button>
	</div>
	<script>
		$(function() {
			function onclickrandom() {
				var len = $('.complete-card').length;
				var random = Math.floor( Math.random() * len ) + 1;
				var html = $('.complete-card').eq(random).html();
				$('#random').html(html);
			}
			$('#random-click').click(onclickrandom);
			onclickrandom();
		});
	</script>
	`);
	touch(target + '/index.html', template);
}		

function createAllCardsPage() {
	const cards = allCards.map(card => createCardFragment(card, true));
	const template = basePage('Toutes les cartes', `
	<div class="all">
		${cards.join('\n')}
	</div>
	`);
	touch(target + '/all.html', template);
}

function createGoldenCardsPage() {
	const cards = allCards.filter(c => c.golden).map(card => createCardFragment(card, true));
	const template = basePage('Toutes les cartes', `
	<div class="all">
		${cards.join('\n')}
	</div>
	`);
	touch(target + '/golden.html', template);
}

function createCategoryIndexPage(category) {
	const cards = categories[category].map(card => createCardFragment(card, true));
	const template = basePage(category, `
	<div class="category">
		${cards.join('\n')}
	</div>
	`);
	touch(target + '/' + category + '/index.html', template);
}

function createCategoryGoldenIndexPage(category) {
	const cards = categories[category].filter(c => c.golden).map(card => createCardFragment(card, true));
	const template = basePage(category, `
	<div class="category">
		${cards.join('\n')}
	</div>
	`);
	touch(target + '/' + category + '-golden/index.html', template);
}

function createCardFragment(card, link) {
	if (card.abstract.length === 0 && card.details.length === 0) {
		return `
		<a href="/cards/${card.category}/index.html">
			<div class="row">
				<div class="col-xs-12 col-sm-6 col-md-5 col-md-offset-1 col-lg-4  col-lg-offset-2">
					<div class="covercard covercard-${card.category}">
						<h3 class="covercard-title">${card.title}</h3>
					</div>
				</div>
				<div class="col-xs-12 col-sm-6 col-md-5  col-lg-4">
					<div class="covercard covercard-${card.category}">
						<h3 class="covercard-title">${card.title}</h3>
					</div>
				</div>
			</div>	
		</a>	
		`;
	}
	const abstract = converter.makeHtml(card.abstract.join('\n\n'));
	const details = converter.makeHtml(card.details.join('\n\n'));
	return `
	<a class="complete-card" href="/cards/${card.category}/${card.id}.html">
		<div class="row card">
			<div class="col-xs-12 col-sm-6 col-md-5 col-md-offset-1 col-lg-4 col-lg-offset-2">
				<div class="cardfront cardfront-${card.category}-${card.golden ? 'golden' : 'normal'}">
					<h3 class="cardfront-top-title">${card.category}</h3>
					<h3 class="cardfront-title">[ ${card.title} ]</h3>
					<div class="cardfront-abstract cardfront-abstract-${card.golden ? 'golden' : 'normal'}">
						${abstract}
					</div>
				</div>
			</div>
			<div class="col-xs-12 col-sm-6 col-md-5 col-lg-4">
				<div class="cardback cardback-${card.category}-${card.golden ? 'golden' : 'normal'}">
					<h3 class="cardback-top-title">${card.category}</h3>
					<h3 class="cardback-title">[ ${card.title} ]</h3>
					<div class="cardback-abstract cardback-abstract-${card.golden ? 'golden' : 'normal'}">
						${details}
					</div>
				</div>
			</div>
		</div>	
	</a>
	`;
}	

function createCardPage(card) {
	const template = basePage(card.title, createCardFragment(card));
	touch(target + '/' + card.category + '/' + card.id + '.html', template);
}		

function generateDistribution() {
	rmLastDistribution().then(() => {
		try {
			mkdirs();
			fs.copySync('./images', target + '/images');
			fs.copySync('./cards.css', target + '/cards.css');
			createIndex();
			createAllCardsPage();
			createGoldenCardsPage();
			allCards.forEach(card => createCardPage(card));
			Object.keys(categories).forEach(category => createCategoryIndexPage(category));
			Object.keys(categories).forEach(category => createCategoryGoldenIndexPage(category));
		} catch (e) {
			console.log(e);
		}
	});
}

generateDistribution();

function basePage(title, content) {
	return `
	<html lang="fr">
		<head>
			<meta charset="utf-8">
			<meta http-equiv="x-ua-compatible" content="ie=edge">
			<title>${title}</title>
			<link rel="shortcut icon" type="image/padding-left" href="/images/icon.png">
			<link rel="apple-touch-icon" href="/cards/images/icon.png">
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css">
			<link href="https://fonts.googleapis.com/css?family=Droid+Sans:400,700" rel="stylesheet">
			<link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet">
			<link href="https://fonts.googleapis.com/css?family=Raleway:400,500" rel="stylesheet">
			<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
			<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
			<link rel="stylesheet" href="/cards/cards.css">
		</head>
		<body>
			${content}
			<ul style="display:flex;justify-content:center;align-items:center;margin-top:20px;">
				<hr/>
				<li><a href="/cards/all.html">Toutes les cartes</a></li>
				<hr/>
				${Object.keys(categories).map(c => `<li><a href="/cards/${c}/index.html">Catégorie ${c}</a></li>`).join('\n')}
				<hr/>
				<li><a href="/cards/golden.html">Toutes les atouts</a></li>
				<hr/>
				${Object.keys(categories).map(c => `<li><a href="/cards/${c}-golden/index.html">Atouts ${c}</a></li>`).join('\n')}
				<hr/>
				<li><a href="https://github.com/MAIF/cards">github</a></li>
				<li><a href="https://maif.github.io">maif oss</a></li>
				<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons Licence" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a>
			</ul>
		</body>
	</html>	
	`;
}