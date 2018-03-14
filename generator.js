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

const categoriesTitles = {
  'time-to-market': categories['time-to-market'][0].title,
  'user-experience': categories['user-experience'][0].title,
  'humain': categories['humain'][0].title,
  'interoperabilite': categories['interoperabilite'][0].title,
  'regles-du-jeu': categories['regles-du-jeu'][0].title,
};

function titleOf(cat) {
	return categoriesTitles[cat] || '';
}

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
	const template = basePage("Les cartes d'architecture MAIF", `
	<div class="hide">
		${allCards.map(card => createCardFragment(card)).join('\n')}
	</div>
  <div class="row"><div class="col-xs-8 col-xs-offset-2"><h1>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</h1></div></div>
	<div id="random"></div>
	<div style="width:100%;display:flex;justify-content:center;align-items:center;margin-bottom:50px;">
	<span id="random-click" type="button"><img src="/cards/images/random.gif" style="width:100px;height:auto;cursor:pointer"></span>
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
	const template = basePage('Tous les atouts', `
	<div class="all">
		${cards.join('\n')}
	</div>
	`);
	touch(target + '/golden.html', template);
}

function createCategoryIndexPage(category) {
	const cards = categories[category].map(card => createCardFragment(card, true));
	const template = basePage(titleOf(category), `
	<div class="category">
		${cards.join('\n')}
	</div>
	`);
	touch(target + '/' + category + '/index.html', template);
}

function createCategoryGoldenIndexPage(category) {
	const cards = categories[category].filter(c => c.golden).map(card => createCardFragment(card, true));
	const template = basePage(titleOf(category), `
	<div class="category">
		${cards.join('\n')}
	</div>
	`);
	touch(target + '/' + category + '-golden/index.html', template);
}

function createCardFragment(card, link) {
	if (card.abstract.length === 0 && card.details.length === 0) {
    // tete de categorie
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
			<link rel="shortcut icon" type="image/padding-left" href="/cards/images/icon.png">
			<link rel="apple-touch-icon" href="/cards/images/icon.png">
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css">
			<link href="https://fonts.googleapis.com/css?family=Droid+Sans:400,700" rel="stylesheet">
			<link href="https://fonts.googleapis.com/css?family=Roboto:400,400i,700,700i" rel="stylesheet">
			<link href="https://fonts.googleapis.com/css?family=Raleway:400,500" rel="stylesheet">
  		<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">
			<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
			<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
			<link rel="stylesheet" href="/cards/cards.css">
		</head>
		<body>
			<nav>
				<div class="toggleMenu">
					<input type="checkbox" />
					<span></span>
					<span></span>
					<span></span>
					<ul class="menu">
						<li><a href="/cards/">Accueil</a></li>
						<li><a href="/cards/all.html">Toutes les cartes</a></li>
						<hr>
						${Object.keys(categories).map(c => `<li><a href="/cards/${c}/index.html">Catégorie "${titleOf(c).toLowerCase()}"</a></li>`).join('\n')}
						<hr>
						<li><a href="https://github.com/MAIF/cards">Les cartes sur Github</a></li>
						<li><a href="https://maif.github.io">Maif oss</a></li>
					</ul>
				</div>
			</nav>
			${content}
			<ul style="width:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;padding-left:0px;margin-top:50px;">
				<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Creative Commons Licence" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a>
			</ul>
      <div class="container-fluid">
				<div class="row">
					<div class="footer">
						<img src="/cards/images/header-home.svg">
					</div>
				</div>
			</div>
		</body>
	</html>
	`;
}
