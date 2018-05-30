const showdown = require('showdown');
const rimraf = require('rimraf');
const fs = require('fs-extra');

const target = './docs';
const converter = new showdown.Converter();

const categories = {
  'time-to-market': require(`./cards/time-to-market/metadata.json`).cards.map(id => require(`./cards/time-to-market/${id}.json`)),
  'user-experience': require(`./cards/user-experience/metadata.json`).cards.map(id => require(`./cards/user-experience/${id}.json`)),
  'human': require(`./cards/human/metadata.json`).cards.map(id => require(`./cards/human/${id}.json`)),
  'interoperability': require(`./cards/interoperability/metadata.json`).cards.map(id => require(`./cards/interoperability/${id}.json`)),
  'rules': require(`./cards/rules/metadata.json`).cards.map(id => require(`./cards/rules/${id}.json`))
};

const categoriesIcons = {
  'time-to-market': '/cards/images/time.svg',
  'user-experience': '/cards/images/ux.svg',
  'human': '/cards/images/human.svg',
  'interoperability': '/cards/images/interop.svg',
  'rules': '/cards/images/neutre.svg',
};

function titleOf(lang, cat) {
	const categoriesTitles = {
		'time-to-market': categories['time-to-market'][0][lang].title,
		'user-experience': categories['user-experience'][0][lang].title,
		'human': categories['human'][0][lang].title,
		'interoperability': categories['interoperability'][0][lang].title,
		'rules': categories.rules[0][lang].title,
	};
	return categoriesTitles[cat] || '';
}

const allCards = [
  ...categories['time-to-market'],
  ...categories['user-experience'],
  ...categories.human,
  ...categories.interoperability,
  ...categories.rules
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
	});
}

function touch(path, content) {
	fs.writeFileSync(path, content);
}

function createIndex(lang, category, card) {
	const template = basePage(lang, "#OSSbyMAIF - The Rules", `
	<div class="hide">
		${allCards.map(card => createCardFragment(lang, card, true)).join('\n')}
	</div>
  <div class="container-fluid">
  	<div class="row header">
  		<div class="col-xs-6 col-xs-offset-3 text-center">
  			<h1 id="theTitle" style="cursor:pointer;"> #OSSbyMAIF - The Rules </h1>
  		</div>
  	</div>
  </div>
    <div class="container-fluid">
	<div id="random" class="row"></div>
	<div style="margin-bottom:50px;">
</div>
	</div>
	<script>
		$(function() {
			var done = false;
			function onclickrandom() {
				if (window.ga && !done) {
					ga('create', 'UA-112498312-1', 'auto');
					done = true;
				}
				if (window.ga) window.ga('send', 'event', 'click', 'random-card');
				var len = $('.complete-card').length;
				var random = Math.floor( Math.random() * len ) + 1;
				var html = $("<div />").append($('.complete-card').eq(random).clone()).html();
				if (html.trim() === '') {
					console.log('retry');
					setTimeout(function() {
						onclickrandom();
					});
				} else {
					$('#random').html(html);
				}
			}
			$('#theTitle').click(function(e) {
				window.location.reload();
			});
			$('#random-click').click(onclickrandom);
			onclickrandom();
			var mc = new Hammer(document.body);
			mc.on("swipeleft swiperight", function(ev) {
				onclickrandom();
			});
		});
	</script>
	`, false, true);
	touch(target + '/' + lang + '/index.html', template);
}

function createAllCardsPage(lang) {
	const cards = allCards.map(card => createCardFragment(lang, card));
	const template = basePage(lang, '#OSSbyMAIF - Toutes les cartes', `
  <div class="container-fluid">
  	<div class="row header">
  		<div class="col-xs-6 col-xs-offset-3 text-center">
  			<h1> Toutes les cartes </h1>
  		</div>
  	</div>
  </div>
	<div class="all">
		${cards.join('\n')}
	</div>
	`);
	touch(target + '/' + lang + '/all.html', template);
}

function createCategoryIndexPage(lang, category) {
	const cards = categories[category].map(card => createCardFragment(lang, card));
	const template = basePage(lang, titleOf(lang, category) + ' - #OSSbyMAIF', `
  <div class="container-fluid">
  	<div class="row header">
  		<div class="col-xs-6 col-xs-offset-3 text-center">
  			<h1> Les cartes de la catégorie "${titleOf(lang, category)}" </h1>
  		</div>
  	</div>
  </div>
	<div class="category">
		${cards.join('\n')}
	</div>
	`);
	touch(target + '/' + lang + '/' + category + '/index.html', template);
}

function createCardFragment(lang, card, rotate = false) {
	if (card[lang].abstract.length === 0 && card[lang].details.length === 0) {
    // tete de categorie
		return `
		<a class="any-card" href="/cards/${card.category}/index.html">
			<div class="row categ-card">
				<div class="col-xs-12 col-sm-5 col-sm-offset-1 col-md-5 col-md-offset-1 col-lg-4  col-lg-offset-2 categ-left">
					<div class="covercard covercard-${card.category}">
						<h3 class="covercard-title">${card[lang].title}</h3>
					</div>
				</div>
				<div class="col-xs-12 col-sm-5 col-md-5 col-lg-4 categ-right">
					<div class="covercard covercard-${card.category}">
						<h3 class="covercard-title">${card[lang].title}</h3>
					</div>
				</div>
			</div>
		</a>
		`;
	}
	const abstract = converter.makeHtml(card[lang].abstract.join('\n\n'));
	const details = converter.makeHtml(card[lang].details.join('\n\n'));
	return `
	<a class="any-card complete-card container-fluid" href="/cards/${card.category}/${card.id}.html" data-content="${(card[lang].title + ' - ' + card[lang].abstract + ' - ' + card[lang].details).toLowerCase()}">
		<div class="row card">
			<div class="col-xs-12 col-sm-5 col-md-5 col-md-offset-1 col-sm-offset-1 col-lg-4 col-lg-offset-2 ${rotate ? 'left' : 'categ-left'}">
				<div class="cardfront cardfront-${card.category}-${card.golden ? 'golden' : 'normal'}">
        <div class="layer"></div>
					<h3 class="cardfront-top-title">${card.category}</h3>
					<h3 class="cardfront-title">[ ${card[lang].title} ]</h3>
					<div class="cardfront-abstract cardfront-abstract-${card.golden ? 'golden' : 'normal'}">
						${abstract}
					</div>
				</div>
			</div>
			<div class="col-xs-12 col-sm-5 col-md-5 col-lg-4 ${rotate ? 'right' : 'categ-right'}">
				<div class="cardback cardback-${card.category}-${card.golden ? 'golden' : 'normal'}">
        <div class="layer"></div>
					<h3 class="cardback-top-title">${card.category}</h3>
					<h3 class="cardback-title">[ ${card[lang].title} ]</h3>
					<div class="cardback-abstract cardback-abstract-${card.golden ? 'golden' : 'normal'}">
						${details}
					</div>
				</div>
			</div>
		</div>
	</a>
	`;
}

function createCardPage(lang, card) {
	const template = basePage(lang, card.title+' - #OSSbyMAIF' , `
  <div class="container-fluid">
  	<div class="row header">
  		<div class="col-xs-6 col-xs-offset-3 text-center">
  			<h1> Carte "${card[lang].title}" </h1>
  		</div>
  	</div>
  </div>
	` + createCardFragment(lang, card, true), false, false);
	touch(target + '/' + lang + '/' + card.category + '/' + card.id + '.html', template);
}

function generateDistribution(lang) {
	rmLastDistribution().then(() => {
		try {
			mkdirs();
			fs.copySync('./src/images', target + '/images');
			fs.copySync('./src/js/tarteaucitron', target + '/js/tarteaucitron');
			fs.copySync('./src/cards.css', target + '/cards.css');
			createIndex(lang);
			createAllCardsPage(lang);
			allCards.forEach(card => createCardPage(lang, card));
			Object.keys(categories).forEach(category => createCategoryIndexPage(lang, category));
		} catch (e) {
			console.log(e);
		}
	});
}

function basePage(lang, title, content, search = true, reload = false) {
	return `
  <!DOCTYPE html>
	<html lang="fr">
		<head>
			<meta charset="utf-8">
			<meta http-equiv="x-ua-compatible" content="ie=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1.0">
			<title>${title}</title>
			<meta name="description" content="${title}" />
			<meta property="og:url" content="https://maif.github.io/cards/" />
			<meta property="og:type" content="article" />
			<meta property="og:title" content="${title}" />
			<meta property="og:description" content="${title}" />
			<meta property="og:image" content="https://maif.github.io/cards/images/maif-black.png" />
			<link rel="shortcut icon" type="image/padding-left" href="/cards/images/icon.png">
			<link rel="apple-touch-icon" href="/cards/images/icon.png">
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
			<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css">
			<link href="https://fonts.googleapis.com/css?family=Droid+Sans:400,700" rel="stylesheet">
			<link href="https://fonts.googleapis.com/css?family=Raleway:400,400i,700,700i" rel="stylesheet">
			<script defer src="https://use.fontawesome.com/releases/v5.0.8/js/all.js"></script>
			<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
			<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
			<script src="https://hammerjs.github.io/dist/hammer.js"></script>
			<link rel="stylesheet" href="/cards/cards.css">
      <script type="text/javascript" src="/cards/js/tarteaucitron/tarteaucitron.js"></script>
      <script type="text/javascript">
				tarteaucitron.init({
					"hashtag": "#tarteaucitron", /* Ouverture automatique du panel avec le hashtag */
					"highPrivacy": false, /* désactiver le consentement implicite (en naviguant) ? */
					"orientation": "bottom", /* le bandeau doit être en haut (top) ou en bas (bottom) ? */
					"adblocker": false, /* Afficher un message si un adblocker est détecté */
					"showAlertSmall": false, /* afficher le petit bandeau en bas à droite ? */
					"cookieslist": true, /* Afficher la liste des cookies installés ? */
					"removeCredit": false /* supprimer le lien vers la source ? */
				});
      </script>
		</head>
		<body>
			<nav>
				<div class="toggleMenu">
					<input type="checkbox" class="menu-input" />
					<span></span>
					<span></span>
					<span></span>
					<ul class="menu">
						<li class="li-allCards"><a href="/cards/all.html">Toutes les cartes</a></li>
						${Object.keys(categories).map(c => `<li><img width="16" height="16" src="${categoriesIcons[c]}" alt="Catégorie ${titleOf(lang, c).toLowerCase()}"/><a href="/cards/${c}/index.html">${titleOf(c).toLowerCase()}</a></li>`).join('\n')}
						<li>
							<input type="text" class="card-search form-control ${search ? '' : 'hide'}" placeholder="rechercher une carte">
						</li>
					</ul>
				</div>
				<div class="maifLogo">
					<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
						<img alt="Creative Commons Licence" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" />
					</a>
					<a href="https://github.com/MAIF/cards">
						<img class="logoGithub" alt="MAIF cards" src="/cards/images/GitHub-Mark-Light-64px.png" />
					</a>
					<a href="https://maif.github.io">
						<img class="logo" alt="MAIF OSS" src="/cards/images/maif-black.png" />
					</a>
				</div>
			</nav>
			${reload ? '<span id="random-click" type="button" data-toggle="tooltip-random" title="" data-original-title="Tirer une nouvelle carte aléatoirement" data-placement="right"><i class="fas fa-sync fa-2x"></i></span>' : ''}
			${!reload ? '<a id="home-click" href="/cards/" title="home"><i class="fas fa-home fa-2x"></i></a>' : ''}
      <a href="#" data-toggle="tooltip" title="" data-original-title="Le jeu de cartes MAIF des principes de conception des nouveaux produits numériques de sa plateforme de services" data-placement="right" id="info-click"><i class="fas fa-question fa-2x"></i></a>
			${content}
			<div class="container-fluid container-footer">
				<div class="row">
					<div class="footer">
						<img src="/cards/images/header-home.svg" alt="décoration du bas de page">
					</div>
				</div>
			</div>
			<script>
				$(function() {
					$('.card-search').on('keyup', function(e) {
						var value = $(this).val().trim().toLowerCase();
						var cards = $('.any-card');
						console.log('value = "' + value + '"')
						cards.map(function(i, c) {
							var card = $(c);
							var content = card.data('content');
							if (!content) {
								card.hide();
							} else if (value === '') {
								card.show();
							} else {
								if (content.indexOf(value) > -1) {
									card.show();
								} else {
									card.hide();
								}
							}
						});
					});
				});
				$(document).ready(function(){
					$('[data-toggle="tooltip"]').tooltip();
					$('[data-toggle="tooltip-random"]').tooltip();
				});
      </script>
      <script type="text/javascript">
				tarteaucitron.user.analyticsUa = 'UA-112498312-1';
				tarteaucitron.user.analyticsMore = function () {};
				(tarteaucitron.job = tarteaucitron.job || []).push('analytics');
			</script>
		</body>
	</html>
	`;
}

generateDistribution('fr');
