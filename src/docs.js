// JavaScript Document
// Planned for future releases: allow topics and sections to be embedded in e-g/e-x, documentation search, menu as a popup on mobile (make other things popup on mobile), Restore default states on reset, Jump to minimized topic will maximize, Massive improvements for columns (animations, reflows, not dragging ui)

//////////////////////
/////// Basics ///////
//////////////////////

var DocsJS = {};
DocsJS.aceTheme = {
	Hailaxian: 'chrome',
	Minimal: 'chrome'
};
DocsJS.apply = function (func){
	'use strict';
	var docs = document.querySelectorAll('[docsjs-tag="'+DocsJS.superparent+'"]');
	for (var docIndex = 0; docIndex < docs.length; docIndex++){
		func(docs[docIndex], docIndex);
	}
};
DocsJS.forEach = function(nodes,callback){
	'use strict';
	for (var n = 0; n < nodes.length; n++){
		callback(nodes[n],n);
	}
};
DocsJS.origin = document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 1].src;
DocsJS.init = function(callback){
	'use strict';
	console.log('DocsJS: init started @',Date.now()-DocsJS.cache.initTime);
	// Set theme
	if (document.getElementById('DocsJS-theme') !== null){
		DocsJS.theme = document.getElementById('DocsJS-theme').href.split('/');
		DocsJS.theme = DocsJS.theme[DocsJS.theme.length-1].split('.')[0];
		if (DocsJS.aceTheme[DocsJS.theme] === undefined){
			console.error(DocsJS.theme + ' is not a theme used by DocsJS. DocsJS will assume the theme (DocsJS.theme =) "Hailaxian" and will use the Ace c-d theme (DocsJS.cd.theme =) "chrome".');
			DocsJS.theme = 'Hailaxian';
		}
	}
	
	// Add essential compenents
	DocsJS.apply(function(doc){
		doc.innerHTML = '<main role="main"><s-c docsjs-tag="s-c"><button role="button" docsjs-tag="accessibility-button" tabindex="0" onclick="DocsJS.toggleRecommendedAccessibility(this)" onkeydown="DocsJS.accessButtonSpaceClick(this,event)">Accessibility Mode</button><div docsjs-tag="header"></div></s-c><s-c docsjs-tag="s-c" style="display:none;"><button role="button" docsjs-tag="accessibility-button" tabindex="0" onclick="DocsJS.toggleExtendedAccessibility()" onkeydown="DocsJS.accessButtonSpaceClick(this,event)">Extended Accessibility Mode</button></s-c>'+doc.innerHTML+'</main>';
	});
	DocsJS.apply(function(doc){
		doc.outerHTML = doc.outerHTML
			.slice(0,-6) +
			'<div docsjs-tag="menu" style="display: none;"></div>' +
			'<div docsjs-tag="column-left" style="position:fixed;">'+DocsJS.column.choice(-1)+'</div>' +
			'<div docsjs-tag="column-right" style="left:100%;position:fixed;">'+DocsJS.column.choice(1)+'</div>' +
			'<div docsjs-extras="learnmore" style="position: relative; width: 100%; height: 1.25em; line-height:1.25em; text-align: center; font-size: 0.75em; opacity: 0.5; text-shadow: -0.04em -0.04em 0.12em #fff,0.04em 0.04em 0.12em #fff,-0.04em 0.04em 0.12em #fff,0.04em -0.04em 0.12em #fff;"><a href="https://hailiax.io/docsjs/" target="_blank" style="text-decoration: none; color: #000; line-height: 1.25em;">– Powered by Docs.JS –</a></div><div docsjs-tag="bg" docsjs-extra="invert"></div>' +
			'</div>';
	});
	DocsJS.fontsize._init = DocsJS.fontsize._value;

	// Finish initiation
	var finish = function(){
		console.log('DocsJS: DocsJS.refresh() done @',Date.now()-DocsJS.cache.initTime);
		window.setTimeout(function(){
			// Watch events
			DocsJS.addEvent(window,'scroll',DocsJS.scrolled);
			DocsJS.addEvent(window,'resize',DocsJS.resized);
			var hashChange = function(){
				var location =  decodeURIComponent(window.location.hash.substr(1));
				window.location.hash = '';
				if (location !== ''){
					DocsJS.jumpTo(location);
				}
			};
			DocsJS.addEvent(window,'hashchange',hashChange);

			DocsJS.scrolled();
			DocsJS.resized();

			// Check for min and max
			var duration = DocsJS.animation.duration;
			DocsJS.animation.duration = 0;
			DocsJS.apply(function(doc){
				DocsJS.forEach(doc.querySelectorAll('[docsjs-state="max"]'),function(el){
					if (el.docsjs.tag === 'e-x' || el.docsjs.tag === 'e-g'){
						el.setAttribute('docsjs-internal-default','max');
						DocsJS.rotate(el.previousSibling.querySelector('[docsjs-tag="button-ebefore"]'),90);
					} else if (el.docsjs.tag === 't-p' || el.docsjs.tag === 'h-d'){
						el.setAttribute('docsjs-internal-default','max');
					} else if (el.docsjs.tag === 's-c'){
						el.setAttribute('docsjs-internal-default','max');
					}
				});
				DocsJS.forEach(doc.querySelectorAll('[docsjs-state="min"]'),function(el){
					if (el.docsjs.tag === 'e-x' || el.docsjs.tag === 'e-g'){
						el.setAttribute('docsjs-internal-default','min');
						el.docsjs.state = 'max';
						el.previousSibling.onclick();
					} else if (el.docsjs.tag === 't-p' || el.docsjs.tag === 'h-d'){
						el.setAttribute('docsjs-internal-default','min');
						el.docsjs.state = 'max';
						el.querySelector('[docsjs-tag="t-l"]').onclick({target:{docsjs:{tag:'t-l'}}});
					} else if (el.docsjs.tag === 's-c'){
						el.setAttribute('docsjs-internal-default','min');
						el.docsjs.state = 'max';
						el.querySelector('[docsjs-tag="button-minimize"]').onclick();
					}
				});
			});
			DocsJS.animation.duration = duration;

			// Accessibility styles
			var accessStyle = document.createElement('style');
			(document.head || document.getElementsByTagName("head")[0]).appendChild(accessStyle);
			var accessStyleText = '[docsjs-tag=accessibility-mode-content] h1,[docsjs-tag=accessibility-mode-content] h2,[docsjs-tag=accessibility-mode-content] h3,[docsjs-tag=accessibility-mode-content] h4,[docsjs-tag=accessibility-mode-content] h5,[docsjs-tag=accessibility-mode-content] h6{line-height:2em;font-weight:bold;text-decoration:underline;margin:0}[docsjs-tag=accessibility-mode-wrapper]{position:fixed;width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch;z-index:999999999999;padding:1em;box-sizing:border-box;background:#eaeaea}[docsjs-tag=accessibility-mode-content]{position:relative;width:100%;left:0;right:0;margin-left:auto;margin-right:auto;padding:1em;background-color:'+DocsJS.getStyle(document.querySelector('[docsjs-tag="t-x"]'),'background-color')+';color:'+DocsJS.getStyle(document.querySelector('[docsjs-tag="t-x"]'),'color')+';box-shadow:0 5px 20px 3px rgba(0,0,0,.3);box-sizing:border-box;overflow:hidden;font-size:1.2em}[docsjs-tag=accessibility-mode-content] p[docsjs-tag=textNode]{display:inline;margin-top:0;margin-bottom:0}[docsjs-tag=accessibility-mode-content] h1{font-size:2.5em}[docsjs-tag=accessibility-mode-content] h2{font-size:2em}[docsjs-tag=accessibility-mode-content] h3{font-size:1.6em}[docsjs-tag=accessibility-mode-content] h4{font-size:1.4em}[docsjs-tag=accessibility-mode-content] h5{font-size:1.2em}[docsjs-tag=accessibility-mode-content] h6{font-size:1.2em; font-weight: regular;}';
			if (typeof accessStyle.styleSheet === 'undefined'){
				accessStyle.innerHTML = accessStyleText;
			} else{
				accessStyle.styleSheet.cssText = accessStyleText;
			}
			
			console.log('DocsJS: layout done @',Date.now()-DocsJS.cache.initTime);
			window.setTimeout(function(){
				// Init cd
				DocsJS.cd.refresh();

				// Done
				if (callback === undefined){callback = function(){};}
				DocsJS.cache.initiated = true;
				callback();
				DocsJS.events.ready();
				window.setTimeout(hashChange,200);
				console.log('DocsJS: Ace done @',Date.now()-DocsJS.cache.initTime);
				console.log('DocsJS: end of init',Date.now());
			},0);
		},0);
	};
	console.log('DocsJS: Essentials rendered @',Date.now()-DocsJS.cache.initTime);
	window.setTimeout(function(){
		DocsJS.refresh(finish);
	},0);
};
window.html5 = {
  'elements': 's-c h-d t-p t-l t-x e-g e-x c-d main nav'
};
DocsJS.refresh = function(callback){
	'use strict';
	// Set theme
	if (DocsJS.cache.initiated){
		document.getElementsByTagName('head')[0].removeChild(document.getElementById('DocsJS-theme'));
		if (DocsJS.theme !== null){
			var themeSheetSrc = DocsJS.origin.split('/');
			themeSheetSrc.pop();
			themeSheetSrc = themeSheetSrc.join('/') + '/themes/'+DocsJS.theme+'.min.css';
			var themeSheet = document.createElement('link');
			themeSheet.rel = 'stylesheet';
			themeSheet.href = themeSheetSrc;
			themeSheet.id = 'DocsJS-theme';
			document.getElementsByTagName('head')[0].appendChild(themeSheet);
		}
	}

	// Process varible tags
	DocsJS.apply(function(doc){
		doc.outerHTML = doc.outerHTML
			.replace(/<v-r (.*?)\W/g,'<div docsjs-tag="v-r" aria-hidden="true" docsjs-name="$1"')
			.replace(new RegExp('</v-r>','g'),'</div>');
	});
	DocsJS.apply(function(doc){
		var varHolder = {};
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="v-r"]'),function(el){
			if (JSON.stringify(el.innerHTML).replace(/\\[\s\S]/g,'').length > 2){
				varHolder[el.docsjs.name] = el.innerHTML;
				el.style.display = 'none';
			} else{
				el.outerHTML = varHolder[el.docsjs.name];
			}
		});
	});

	// Add buttons and formatting
	DocsJS.apply(function(doc){
		var recurse;
		recurse = function(s){
			DocsJS.forEach(s.querySelectorAll('h-d > t-l'),function(el){
				el.parentElement.setAttribute('aria-labelledby','docsjs-aria-section-'+el.textContent.replace(/\W+/g,'_'));
				el.setAttribute('docsjs-arialabel','docsjs-aria-section-'+el.textContent.replace(/\W+/g,'_'));
				var minimizeButton = document.createElement('div');
				minimizeButton.setAttribute('docsjs-tag','button-minimize');
				minimizeButton.innerHTML = DocsJS.buttons.minimize.html();
				el.appendChild(minimizeButton);
				recurse(el);
			});
		};
		recurse(doc);
		var tpCounter = 0;
		recurse = function(s){
			tpCounter++;
			DocsJS.forEach(s.querySelectorAll('t-p > t-l'),function(el){
				el.parentElement.setAttribute('aria-labelledby','docsjs-aria-topic-'+el.textContent.replace(/\W+/g,'_')+tpCounter);
				el.setAttribute('docsjs-arialabel','docsjs-aria-topic-'+el.textContent.replace(/\W+/g,'_')+tpCounter);
				var minimizeButton = document.createElement('div');
				minimizeButton.setAttribute('docsjs-tag','button-menu');
				minimizeButton.setAttribute('docsjs-state','max');
				minimizeButton.setAttribute('docsjs-internal','menuHidden');
				minimizeButton.innerHTML = DocsJS.buttons.menu.html();
				el.appendChild(minimizeButton);
				recurse(el);
			});
		};
		recurse(doc);
		var egCounter = 0;
		recurse = function(s){
			egCounter++;
			DocsJS.forEach(s.querySelectorAll('e-g'),function(el){
				el.setAttribute('labelledby','docsjs-aria-eg-'+(el.docsjs.name === undefined? DocsJS.eg.name.replace(/\W+/g,'_')+egCounter : el.docsjs.name.replace(/\W+/g,'_')+egCounter));
				if (el.docsjs.state === undefined){
					el.setAttribute('docsjs-state',DocsJS.eg.defaultState);
				}
				if (el.previousSibling === null || el.previousSibling.docsjs === undefined || (el.previousSibling.docsjs.tag !== 'ebefore' && el.parentElement.docsjs.tag !== 'column-content')){
					el.insertAdjacentHTML( 'beforeBegin', '<div docsjs-tag="ebefore" role="button" tabindex="0" id="docsjs-aria-eg-'+(el.docsjs.name === undefined? DocsJS.eg.name.replace(/\W+/g,'_')+egCounter : el.docsjs.name.replace(/\W+/g,'_')+egCounter)+'"><div docsjs-tag="button-ebefore" >'+DocsJS.buttons.eg.html()+'</div>'+(el.docsjs.name === undefined? DocsJS.eg.name : el.docsjs.name)+'</div>' );
				}
				recurse(el);
			});
		};
		recurse(doc);
		var exCounter = 0;
		recurse = function(s){
			exCounter++;
			DocsJS.forEach(s.querySelectorAll('e-x'),function(el){
				el.setAttribute('labelledby','docsjs-aria-ex-'+(el.docsjs.name === undefined? DocsJS.eg.name.replace(/\W+/g,'_')+exCounter : el.docsjs.name.replace(/\W+/g,'_')+exCounter));
				if (el.docsjs.state === undefined){
					el.setAttribute('docsjs-state',DocsJS.ex.defaultState);
				}
				if (el.previousSibling === null || el.previousSibling.docsjs === undefined || el.previousSibling.docsjs.tag !== 'ebefore'){
					el.insertAdjacentHTML( 'beforeBegin', '<div docsjs-tag="ebefore" role="button" tabindex="0" id="docsjs-aria-ex-'+(el.docsjs.name === undefined? DocsJS.ex.name.replace(/\W+/g,'_')+exCounter : el.docsjs.name.replace(/\W+/g,'_')+exCounter)+'"><div docsjs-tag="button-ebefore" >'+DocsJS.buttons.ex.html()+'</div>'+(el.docsjs.name === undefined? DocsJS.ex.name : el.docsjs.name)+'</div>' );
				}
				recurse(el);
			});
		};
		recurse(doc);
		recurse = function(s){
			DocsJS.forEach(s.querySelectorAll('t-p,h-d'),function(el){
				el.innerHTML += '<div docsjs-tag="efiller" docsjs-side="left" aria-hidden="true"></div><div docsjs-tag="efiller" docsjs-side="right" aria-hidden="true"></div>';
				if (el.docsjs.state === undefined){
					el.setAttribute('docsjs-state','max');
				}
				recurse(el);
			});
		};
		recurse(doc);
		recurse = function(s){
			DocsJS.forEach(s.querySelectorAll('s-c'),function(el){
				if (el.querySelector('h-d') !== null){
					el.setAttribute('aria-labelledby','docsjs-aria-section-'+el.querySelector('h-d').querySelector('t-l').textContent.replace(/\W+/g,'_'));
				}
				if (el.docsjs.state === undefined){
					el.setAttribute('docsjs-state','max');
				}
				recurse(el);
			});
		};
		recurse(doc);
	});
	
	// Convert to div soup
	DocsJS.apply(function(doc){
		doc.innerHTML = doc.innerHTML
			.replace(/<s-c/g,'<s-c docsjs-tag="s-c"')
			.replace(/<h-d/g,'<h-d docsjs-tag="h-d"')
			.replace(/<t-p/g,'<t-p docsjs-tag="t-p"')
			.replace(/<t-l/g,'<t-l docsjs-tag="t-l"')
			.replace(/<t-x/g,'<t-x docsjs-tag="t-x"')
			.replace(/<e-g/g,'<e-g docsjs-tag="e-g"')
			.replace(/<e-x/g,'<e-x docsjs-tag="e-x"')
			.replace(/<c-d/g,'<c-d docsjs-tag="c-d"');
	});

	// Generate accessiblity
	DocsJS.apply(function(doc){
		var access = '';
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="'+DocsJS.superparent+'"]>main>s-c'),function(el){
			var read = function(el, level){
				if (level > 6){level = 6;}
				DocsJS.forEach(el.childNodes,function(el){
					if (el.nodeType === 1){
						switch (el.hasAttribute('docsjs-tag')? el.docsjs.tag: el.tagName){
							case 'h-d':
								read(el,(level+1));
								level++;
								break;
							case 't-p':
								read(el,(level+1));
								break;
							case 's-c':
								read(el,level);
								break;
							case 't-l':
								el.innerHTML = '<h'+(level+1)+' id="'+el.docsjs.arialabel+'">'+el.innerHTML+'</h'+(level+1)+'>';
								access += '<h'+level+'>'+el.textContent+'</h'+level+'>';
								break;
							case 't-x':
								read(el,level);break;
							case 'e-g':
								access += '<h'+(level+1)+'>'+(el.hasAttribute('docsjs-name')? el.docsjs.name: DocsJS.eg.name)+'</h'+(level+1)+'>';
								read(el,level);break;
							case 'e-x':
								access += '<h'+(level+1)+'>'+(el.hasAttribute('docsjs-name')? el.docsjs.name: DocsJS.ex.name)+'</h'+(level+1)+'>';
								read(el,level);break;
							case 'c-d':
								access += '<pre style="position:relative; display:block; overflow:auto;"><code>'+el.innerHTML+'</code></pre>';
								break;
							case 'ebefore':
							case 'efiller':
								break;
							default:
								access += el.outerHTML;
								break;
						}
					} else if (el.nodeType === 3){
						access += '<p docsjs-tag="textNode">'+el.nodeValue.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
							return '&#'+i.charCodeAt(0)+';' + '</p>';
						});
					}
				});
			};
			read(el, 0);
		});
		DocsJS.cache.accessibility = '<main role="main" docsjs-tag="accessibility"><div docsjs-tag="accessibility-mode-wrapper"><div docsjs-tag="accessibility-mode-background"></div><div docsjs-tag="accessibility-mode-content" style="max-width:'+DocsJS.width.max+'px;">'+access+'</div></div></main>';
	});

	// Generate menu
	DocsJS.apply(function(doc,index){
		var menu = doc.querySelector('[docsjs-tag="menu"]');
		var readStructure = function(parent, location){
			var structure = '';
			var contents = parent.querySelectorAll('[docsjs-tag="s-c"],[docsjs-tag="t-p"]');
			if (contents.length !== 0){
				var sub = 0;
				for (var i = 0; i < contents.length; i++){
					if (contents[i].nodeType === 1 && contents[i].parentElement === parent){
						var newLocation = location + '.' + (i-sub);
						contents[i].setAttribute('docsjs-location',newLocation);
						var title = (contents[i].querySelector('[docsjs-tag="t-l"]') || contents[i].querySelector('[docsjs-tag="h-d"] > [docsjs-tag="t-l"]') || undefined);
						if (title !== undefined){
							structure += '<div docsjs-tag="menu-item" docsjs-state="max" onclick="'+"if ((event.target || (event.srcElement || event.originalTarget)) === this){if (this.docsjs.state === 'min'){this.docsjs.state = 'max';} else{this.docsjs.state = 'min';}}"+'"><div docsjs-tag="menu-title" role="button" tabindex="0" aria-labelledby="Navigate to '+title.innerText+'" docsjs-state="" docsjs-menu-location="'+newLocation+'" onkeyup="DocsJS.spaceClick(this,event)" onclick="DocsJS._menuClicked(this,'+"'"+newLocation+"'"+');" docsjs-menu-destination="'+contents[i].docsjs.tag+'">'+title.innerText+'</div>'+readStructure(contents[i],newLocation)+'</div>';
						}
					} else{
						sub++;
					}
				}
				return structure;
			} else{
				return '';
			}
		};
		menu.innerHTML = '<div docsjs-tag="menu-preferences"><div docsjs-tag="menu-preferences-item" docsjs-pref="aA" role="button" tabindex="0" aria-label="Increase Font-size">'+DocsJS.buttons.fontplus()+'</div><div docsjs-tag="menu-preferences-item" docsjs-pref="Aa" role="button" tabindex="0" aria-label="Decrease Font-size">'+DocsJS.buttons.fontminus()+'</div><div docsjs-tag="menu-preferences-item" docsjs-pref="O" role="button" tabindex="0" aria-label="Minimize everything">'+DocsJS.buttons.menuminimized()+'</div>'+/*'<div docsjs-tag="menu-preferences-item" docsjs-pref="CM" role="button" tabindex="0" aria-label="Expand summaries and minimize everything else">'+DocsJS.buttons.partialminimize()+'</div>'+*/'<div docsjs-tag="menu-preferences-item" docsjs-pref="C" role="button" tabindex="0" aria-label="Expand everything">'+DocsJS.buttons.menuminimize()+'</div><div docsjs-tag="menu-preferences-item" docsjs-pref="Iv" role="button" tabindex="0" aria-label="Invert colors">'+DocsJS.buttons.invert()+'</div>'+/*'<div docsjs-tag="menu-preferences-item" docsjs-pref="GPU" role="button" tabindex="0" aria-label="Remove animations">'+DocsJS.buttons.gpu()+'</div>'+*/'<div docsjs-tag="menu-preferences-item" docsjs-pref="Rs">'+DocsJS.buttons.reset()+'</div></div>'+
			'<div docsjs-tag="menu-item"><div docsjs-tag="menu-title" docsjs-state="" docsjs-menu-location="'+DocsJS.menu.top+'" onclick="DocsJS._menuClicked(this,'+"'"+DocsJS.menu.top+"'"+');" docsjs-menu-destination="'+DocsJS.menu.top+'">'+DocsJS.menu.top+'</div></div>'+
			readStructure(doc.querySelector('main') || doc, index)+
			'<div docsjs-tag="menu-item"><div docsjs-tag="menu-title" docsjs-state="" docsjs-menu-location="'+DocsJS.menu.bottom+'" onclick="DocsJS._menuClicked(this,'+"'"+DocsJS.menu.bottom+"'"+');" docsjs-menu-destination="'+DocsJS.menu.bottom+'">'+DocsJS.menu.bottom+'</div></div>';
		
		doc.querySelector('[docsjs-tag="header"]').innerHTML = '';
		DocsJS.forEach(doc.querySelectorAll('main>s-c'),function(el){
			try{doc.querySelector('[docsjs-tag="header"]').innerHTML += '<span onclick="DocsJS.jumpTo(\''+el.docsjs.location+'\')">' + el.querySelector('[docsjs-tag="t-l"]').textContent + '</span> ';}catch(e){}
		});
	});

	// Bind buttons
	DocsJS.apply(function(doc){
		DocsJS.bindPrefs();
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="button-minimize"]'),function(el){
			var click = function(){
				el.onclick = function(){};
				var d = (el.parentElement.parentElement.parentElement.parentElement.docsjs.state === 'max')? 1 : 0;
				var tl = el.parentElement.parentElement;
				var hd = el.parentElement.parentElement.parentElement;
				var sc = el.parentElement.parentElement.parentElement.parentElement;
				var tlHeight = parseInt(DocsJS.getStyle(tl,'height')) + parseInt(DocsJS.getStyle(tl,'padding-top')) + parseInt(DocsJS.getStyle(tl,'padding-bottom')) + parseInt(DocsJS.getStyle(tl,'border-top-width')) + parseInt(DocsJS.getStyle(tl,'border-bottom-width')) + parseInt(DocsJS.getStyle(sc,'padding-top')) + parseInt(DocsJS.getStyle(sc,'padding-bottom'));
				var scStyle = sc.style.height;
				sc.style.height = '';
				var hdStyle = hd.style.height;
				hd.style.height = '';
				var scHeight = parseInt(DocsJS.getStyle(sc,'height'));
				sc.style.height = scStyle;
				hd.style.height = hdStyle;
				DocsJS.animate({
					from: d,	to: 1-d,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
					pass: [el,d,scHeight,tlHeight],
					step: function(now, pass){
						DocsJS.buttons.minimize.animation(pass[0].querySelector('[docsjs-tag="button-parent"]'),now);
						pass[0].parentElement.parentElement.parentElement.parentElement.style.height = (pass[2]-pass[3])*now + pass[3] + 'px';
					},
					callback: function(pass){
						if (pass[1] === 0){
							pass[0].parentElement.parentElement.parentElement.parentElement.style.height = '';
						} else{
							pass[0].parentElement.parentElement.parentElement.parentElement.style.height = pass[3] + 'px';
						}
						pass[0].onclick = click;
						DocsJS.scrolled();
						DocsJS.correctColumnHeight(doc);
					}
				});
				if (d === 0){
					el.parentElement.parentElement.parentElement.parentElement.docsjs.state = 'max';
					if (el.parentElement.parentElement.parentElement.docsjs.state === 'min'){
						el.parentElement.parentElement.onclick({target:{docsjs:{tag:'_change'}}});
					}
				} else{
					el.parentElement.parentElement.parentElement.parentElement.docsjs.state = 'min';
					if (el.parentElement.parentElement.parentElement.docsjs.state === 'max'){
						el.parentElement.parentElement.onclick({target:{docsjs:{tag:'_change'}}});
					}
				}
				DocsJS.forEach(doc.querySelectorAll('[docsjs-menu-location="'+el.parentElement.parentElement.parentElement.parentElement.docsjs.location+'"]'),function(el){
					el.parentElement.docsjs.state = d === 0? 'max' : 'min';
				});
				DocsJS.events.sectionToggle(el.parentElement.parentElement.parentElement.parentElement);
			};
			el.onclick = click;
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="button-menu"]'),function(el){
			var click = function(){
				el.onclick = function(){};
				var d = (el.docsjs.internal === 'menuHidden')? 1 : 0;
				if (d === 1){
					var menu = doc.querySelector('[docsjs-tag="menu"]').cloneNode(true);
					menu.style.display = 'block';
					el.parentElement.parentElement.parentElement.insertBefore(menu,el.parentElement.parentElement.nextElementSibling);
					if (el.parentElement.parentElement.parentElement.docsjs.state === 'min'){
						el.parentElement.parentElement.onclick({target:{docsjs:{tag:'t-l'}}});
					}
					el.docsjs.internal = 'menuVisible';
				} else{
					el.docsjs.internal = 'menuHidden';
				}
				DocsJS.bindPrefs();
				DocsJS.animate({
					from: d,	to: 1-d,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
					pass: [el,d,parseInt(DocsJS.getStyle(el.parentElement.parentElement.parentElement.querySelector('[docsjs-tag="menu"]'),'height')),parseInt(DocsJS.getStyle(el.parentElement.parentElement.parentElement.querySelector('[docsjs-tag="menu"]'),'padding-top')),parseInt(DocsJS.getStyle(el.parentElement.parentElement.parentElement.querySelector('[docsjs-tag="menu"]'),'padding-bottom')),parseInt(DocsJS.getStyle(el.parentElement.parentElement.parentElement.querySelector('[docsjs-tag="menu"]'),'border-top-width')),parseInt(DocsJS.getStyle(el.parentElement.parentElement.parentElement.querySelector('[docsjs-tag="menu"]'),'border-bottom-width'))],
					step: function(now, pass){
						now = 1-now;
						DocsJS.buttons.menu.animation(pass[0].querySelector('[docsjs-tag="button-parent"]'),now);
						var mn = pass[0].parentElement.parentElement.parentElement.querySelector('[docsjs-tag="menu"]');
						mn.style.height = pass[2]*now+'px';
						mn.style.paddingTop = pass[3]*now+'px';
						mn.style.paddingBottom = pass[4]*now+'px';
						mn.style.borderTopWidth = pass[5]*now+'px';
						mn.style.borderBottomWidth = pass[6]*now+'px';
					},
					callback: function(pass){
						if (pass[1] === 0){											
							pass[0].parentElement.parentElement.parentElement.removeChild(pass[0].parentElement.parentElement.parentElement.querySelector('[docsjs-tag="menu"]'));
						} else{
							var menu = pass[0].parentElement.parentElement.parentElement.querySelector('[docsjs-tag="menu"]');
							menu.style.height = 'auto';
							menu.style.padding = menu.style.paddingTop = menu.style.paddingBottom = menu.style.borderTopWidth = menu.style.borderBottomWidth = '';
						}
						pass[0].onclick = click;
						DocsJS.correctColumnHeight(doc);
					}
				});
				DocsJS.events.menuToggle(el.parentElement.parentElement.parentElement.querySelector('[docsjs-tag="menu"]'));
			};
			el.onclick = click;
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="t-l"]'),function(el){
			var click = function(e){
				if ((e.target || (e.srcElement || e.originalTarget)).docsjs.tag === 't-l' || (e.target || (e.srcElement || e.originalTarget)).docsjs.tag === '_change' || (e.target || (e.srcElement || e.originalTarget)).tagName.charAt(0) === 'H'){
					if (el.parentElement.docsjs.tag === 'h-d' && el.parentElement.parentElement.docsjs.state === 'min' && el.parentElement.docsjs.state === 'min'){
						el.querySelector('[docsjs-tag="button-minimize"]').onclick();
					} else{
						el.onclick = function(){};
						var d = (el.parentElement.docsjs.state === 'max')? 1 : 0;
						var heightBackup = el.parentElement.style.height;
						el.parentElement.style.height = '';
						var tpHeight = parseInt(DocsJS.getStyle(el.parentElement,'height'));
						el.parentElement.style.height = heightBackup;
						var tlHeight = parseInt(DocsJS.getStyle(el,'height'))+parseInt(DocsJS.getStyle(el,'padding-top'))+parseInt(DocsJS.getStyle(el,'padding-bottom'))+parseInt(DocsJS.getStyle(el,'border-top-width'))+parseInt(DocsJS.getStyle(el,'border-bottom-width'));
						DocsJS.animate({
							from: d,	to: 1-d,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
							pass: [el,d,tpHeight-tlHeight,tlHeight],
							step: function(now, pass){
								pass[0].parentElement.style.height = (pass[2])*now + pass[3] + 'px';
							},
							callback: function(pass){
								if (pass[1] === 0){pass[0].parentElement.style.height = 'auto';}
								DocsJS.correctColumnHeight(doc);
								pass[0].parentElement.docsjs.state = (pass[1] === 0)? 'max' : 'min';
								pass[0].onclick = click;
							}
						});
						if (el.parentElement.docsjs.tag === 't-p'){
							DocsJS.forEach(doc.querySelectorAll('[docsjs-menu-location="'+el.parentElement.docsjs.location+'"]'),function(el){
								if (el.parentElement.childNodes.length > 1){
									el.parentElement.docsjs.state = d === 0? 'max' : 'min';
								}
							});
						}
						DocsJS.events.topicToggle(el.parentElement.parentElement);
					}
				}
			};
			el.onclick = click;
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="ebefore"]'),function(el){
			var click = function(){
				el.onclick = function(){};
				var d = (el.nextSibling.docsjs.state === 'max')? 1 : 0;
				var x = el.nextSibling.style.height;
				var y = el.nextSibling.style.paddingTop;
				var z = el.nextSibling.style.paddingBottom;
				el.nextSibling.style.height = '';
				el.nextSibling.style.paddingTop = '';
				el.nextSibling.style.paddingBottom = '';
				var a = parseInt(DocsJS.getStyle(el.nextSibling,'height'));
				var b = parseInt(DocsJS.getStyle(el.nextSibling,'padding-top'));
				var c = parseInt(DocsJS.getStyle(el.nextSibling,'padding-bottom'));
				var e = parseInt(DocsJS.getStyle(el.nextSibling,'border-top-width'));
				var f = parseInt(DocsJS.getStyle(el.nextSibling,'border-bottom-width'));
				el.nextSibling.style.height = x;
				el.nextSibling.style.paddingTop = y;
				el.nextSibling.style.paddingBottom = z;
				DocsJS.animate({
					from: d,	to: 1-d,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
					pass: [el.nextSibling,d,a,b,c,e,f],
					step: function(now, pass){
						pass[0].style.height = pass[2]*now+'px';
						pass[0].style.paddingTop = pass[3]*now+'px';
						pass[0].style.paddingBottom = pass[4]*now+'px';
						pass[0].style.borderTopWidth = pass[5]*now+'px';
						pass[0].style.borderBottomWidth = pass[6]*now+'px';
						if (pass[0].docsjs.tag === 'e-x'){
							DocsJS.buttons.ex.animation(pass[0].previousSibling.querySelector('[docsjs-tag="button-ebefore"]'),now);
						} else if (pass[0].docsjs.tag === 'e-g'){
							DocsJS.buttons.eg.animation(pass[0].previousSibling.querySelector('[docsjs-tag="button-ebefore"]'),now);
						}
					},
					callback: function(pass){
						pass[0].docsjs.state = (pass[1] === 0)? 'max' : 'min';
						if (pass[1] === 0){
							pass[0].style.height = pass[0].style.paddingTop = pass[0].style.paddingBottom = pass[0].style.borderTopWidth = pass[0].style.borderBottomWidth = '';
						} else{
							pass[0].style.height = pass[0].style.paddingTop = pass[0].style.paddingBottom = pass[0].style.borderTopWidth = pass[0].style.borderBottomWidth = '0px';
						}
						pass[0].previousSibling.onclick = click;
						DocsJS.scrolled();
						DocsJS.correctColumnHeight(doc);
					}
				});
				DocsJS.events.eToggle(el.nextSibling);
			};
			el.onclick = click;
			el.onkeyup = function(e){
				var keyCode = e.which || e.keyCode;
				if (keyCode === 32 || keyCode === 13){
					click();
				}
			};
		});
	});

	// Watch column drags
	DocsJS.apply(function(doc){
		var exposeClose = function(d){
			if (DocsJS.column.state[0] !== 'none' && DocsJS.cache.events.oncolumn < 0){
				DocsJS.animate({
					from: parseFloat(doc.querySelector('[docsjs-tag="column-left"]').lastChild.style.marginLeft),	to:-1*(100+DocsJS.cache.extraWidth)*(1-d),	duration: DocsJS.animation.duration, easing: DocsJS.easings.easeOutQuart, step: function(now){
						if (DocsJS.column.state[0] !== 'none'){
							doc.querySelector('[docsjs-tag="column-left"]').lastChild.style.marginLeft = now +'px';
						}
					}
				});
			} else if (DocsJS.column.state[1] !== 'none' && DocsJS.cache.events.oncolumn > 0){
				DocsJS.animate({
					from: parseFloat(doc.querySelector('[docsjs-tag="column-right"]').lastChild.style.marginRight),	to:-1*(100+DocsJS.cache.extraWidth)*(1-d),	duration: DocsJS.animation.duration, easing: DocsJS.easings.easeOutQuart, step: function(now){
						if (DocsJS.column.state[1] !== 'none'){
							doc.querySelector('[docsjs-tag="column-right"]').lastChild.style.marginRight = now +'px';
						}
					}
				});
			}
		};

		var mousedown = function(e){
			if (DocsJS.cache.events.oncolumn !== 0){
				DocsJS.removeEvent(doc,'mousedown',mousedown);
				exposeClose(1);
				var start = e.clientX;
				var mousemove = function(e){
					var delta = DocsJS.cache.events.oncolumn*(start - e.clientX);
					start = e.clientX;
					DocsJS.columnOffsets[(DocsJS.cache.events.oncolumn < 0 ? 'left' : 'right')] += delta;
					DocsJS.resized();
					DocsJS.events.columnResize(DocsJS.cache.events.oncolumn < 0 ? 'left' : 'right');
				};
				DocsJS.addEvent(doc,'mousemove',mousemove);
				var mouseup = function(){
					exposeClose(0);
					DocsJS.correctColumnHeight(doc);
					DocsJS.removeEvent(doc,'mousemove',mousemove);
					DocsJS.removeEvent(doc,'mouseup',mouseup);
					DocsJS.checkColumns(doc);
					DocsJS.cache.events.oncolumn = 0;
					DocsJS.resized();
					DocsJS.addEvent(doc,'mousedown',mousedown);
				};
				DocsJS.addEvent(doc,'mouseup',mouseup);
			}
		};
		DocsJS.addEvent(doc,'mousedown',mousedown);

		var touchstart = function(e){
			if (DocsJS.cache.events.oncolumn !== 0){
				DocsJS.removeEvent(doc,'touchstart',touchstart);
				exposeClose(1);
				var start = e.touches[0].pageX;
				var touchmove = function(e){
					var delta = DocsJS.cache.events.oncolumn*(start - e.touches[0].pageX);
					start = e.touches[0].pageX;
					DocsJS.columnOffsets[(DocsJS.cache.events.oncolumn < 0 ? 'left' : 'right')] += delta;
					DocsJS.resized();
				};
				DocsJS.addEvent(doc,'touchmove',touchmove,DocsJS.supports.passive? {passive: true} : false);
				var touchend = function(){
					exposeClose(0);
					DocsJS.correctColumnHeight(doc);
					DocsJS.removeEvent(doc,'touchmove',touchmove);
					DocsJS.removeEvent(doc,'touchend',touchend);
					DocsJS.checkColumns(doc);
					DocsJS.cache.events.oncolumn = 0;
					DocsJS.resized();
					doc.ontouchstart = touchstart;
				};
				DocsJS.addEvent(doc,'touchend',touchend,DocsJS.supports.passive? {passive: true} : false);
			}
		};
		DocsJS.addEvent(doc,'touchstart',touchstart,DocsJS.supports.passive? {passive: true} : false);
	});

	// Pass c-d tags to c9 ace
	if (DocsJS.cache.initiated){
		DocsJS.cd.refresh();
	}

	// Done
	if (typeof callback === 'function'){
		callback();
	}
	return 1;
};

//////////////////////
/////// Events ///////
//////////////////////

DocsJS.scrolled = function(){
	'use strict';
	DocsJS.apply(function(doc){
		var topEl = false;
		var nextTopEl = false;
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="t-p"],[docsjs-tag="h-d"]'),function(el){
			if (el.docsjs.tag === 't-p'){
				el.querySelector('[docsjs-tag="button-menu"]').docsjs.state = 'inactive';
				if (nextTopEl === true){
					nextTopEl = el;
				}
			}
			var top = (el.querySelector('[docsjs-tag="t-l"]').getBoundingClientRect().top+el.querySelector('[docsjs-tag="t-l"]').getBoundingClientRect().bottom)/2;
			if (top > 0 && el.parentElement.docsjs.state === 'max' && !topEl){
				topEl = el;
				nextTopEl = true;
			}
		});
		if (topEl !== false){
			if (topEl.docsjs.tag === 't-p'){
				topEl.querySelector('[docsjs-tag="button-menu"]').docsjs.state = 'active';
			} else{
				nextTopEl.querySelector('[docsjs-tag="button-menu"]').docsjs.state = 'active';
			}
			topEl = topEl.docsjs.location || topEl.parentElement.docsjs.location;
			DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="menu"]'),function(el){
				DocsJS.forEach(el.querySelectorAll('[docsjs-tag="menu-title"]'),function(ti){
					if (DocsJS.window.scrollTop() === 0){
						ti.docsjs.state = '';
						el.querySelectorAll('[docsjs-tag="menu-title"]')[0].docsjs.state = 'youarehere';
					} else if (DocsJS.window.scrollTop() === document.body.scrollHeight - DocsJS.window.height()){
						ti.docsjs.state = '';
						el.querySelectorAll('[docsjs-tag="menu-title"]')[el.querySelectorAll('[docsjs-tag="menu-title"]').length-1].docsjs.state = 'youarehere';
					} else{
						if (ti.docsjs.menuLocation === topEl){
							ti.docsjs.state = 'youarehere';
						} else{
							ti.docsjs.state = '';
						}
					}
				});
				if (doc.querySelector('[docsjs-tag="column-left"] [docsjs-state="youarehere"]') !== null){
					var diffBtm = DocsJS.window.height() - doc.querySelector('[docsjs-tag="column-left"] [docsjs-state="youarehere"]').getBoundingClientRect().bottom;
					var diffTop = doc.querySelector('[docsjs-tag="column-left"] [docsjs-state="youarehere"]').getBoundingClientRect().top;
					if (diffBtm < 0){
						doc.querySelector('[docsjs-tag="column-left"] > [docsjs-tag="column-content"]').scrollTop -= diffBtm;
					} else if (diffTop < 0){
						doc.querySelector('[docsjs-tag="column-left"] > [docsjs-tag="column-content"]').scrollTop += diffTop;
					}
				}
			});
		}
	});
};
DocsJS.resized = function(){
	'use strict';
	var docWidth, docMargin, rc, lc;
	DocsJS.apply(function(doc){
		rc = doc.querySelector('[docsjs-tag="column-right"]');
		lc = doc.querySelector('[docsjs-tag="column-left"]');
	});
	DocsJS.cache.extraWidth = 0;
	if (DocsJS.window.width() > DocsJS.width.max + 200){
		DocsJS.apply(function(doc){
			doc.style.fontSize = DocsJS.fontsize._value+'px';
			var width = (DocsJS.window.width() - DocsJS.width.max)/2;
			DocsJS.cache.extraWidth = width-100;
			lc.style.width = width+DocsJS.columnOffsets.left+'px';
			rc.style.width = width+DocsJS.columnOffsets.right+'px';
			rc.style.marginLeft = -1*width-DocsJS.columnOffsets.right+'px';
			DocsJS.forEach(doc.querySelectorAll('main > [docsjs-tag="s-c"]'),function(el){
				el.style.width = doc.querySelector('[docsjs-extras="learnmore"]').style.width = docWidth = DocsJS.width.max-DocsJS.columnOffsets.left-DocsJS.columnOffsets.right+'px';
				el.style.marginLeft = doc.querySelector('[docsjs-extras="learnmore"]').style.marginLeft = docMargin = width+DocsJS.columnOffsets.left+'px';
			});
		});
		if (DocsJS.width.max-DocsJS.columnOffsets.left-DocsJS.columnOffsets.right < DocsJS.width.min){
			if (DocsJS.columnOffsets.left > DocsJS.columnOffsets.right){
				DocsJS.columnOffsets.left-=DocsJS.width.min - DocsJS.width.max+DocsJS.columnOffsets.left+DocsJS.columnOffsets.right;
			} else{
				DocsJS.columnOffsets.right-=DocsJS.width.min - DocsJS.width.max+DocsJS.columnOffsets.left+DocsJS.columnOffsets.right;
			}
		}
		if (DocsJS.columnOffsets.left < -50){
			DocsJS.columnOffsets.left = -50;
		}
		if (DocsJS.columnOffsets.right < -50){
			DocsJS.columnOffsets.right = -50;
		}
	} else if (DocsJS.window.width() > DocsJS.width.min + 200){
		if (DocsJS.columnOffsets.left === 0 && DocsJS.columnOffsets.right === 0 && DocsJS.window.width()-DocsJS.width.min < 400){
			DocsJS.columnOffsets.left = DocsJS.columnOffsets.right = -49.87656421;
		} else if (DocsJS.window.width()-DocsJS.width.min > 400){
			if (DocsJS.columnOffsets.left === -49.87656421){
				DocsJS.columnOffsets.left = 0;
			}
			if (DocsJS.columnOffsets.right === -49.87656421){
				DocsJS.columnOffsets.right = 0;
			} 
		}
		DocsJS.apply(function(doc){
			doc.style.fontSize = DocsJS.fontsize._value+'px';
			lc.style.width = 100+DocsJS.columnOffsets.left+'px';
			rc.style.width = 100+DocsJS.columnOffsets.right+'px';
			rc.style.marginLeft = -1*100-DocsJS.columnOffsets.right+'px';
			DocsJS.forEach(doc.querySelectorAll('main > [docsjs-tag="s-c"]'),function(el){
				el.style.width = DocsJS.window.width()-200-DocsJS.columnOffsets.left-DocsJS.columnOffsets.right+'px';
				el.style.marginLeft = 100+DocsJS.columnOffsets.left+'px';
			});
		});
		if (DocsJS.window.width()-DocsJS.columnOffsets.left-DocsJS.columnOffsets.right < DocsJS.width.min + 200){
			if (DocsJS.columnOffsets.left > DocsJS.columnOffsets.right){
				DocsJS.columnOffsets.left-=DocsJS.width.min + 200 - DocsJS.window.width()+DocsJS.columnOffsets.left+DocsJS.columnOffsets.right;
			} else{
				DocsJS.columnOffsets.right-=DocsJS.width.min + 200 - DocsJS.window.width()+DocsJS.columnOffsets.left+DocsJS.columnOffsets.right;
			}
		}
		if (DocsJS.columnOffsets.left < -50){
			DocsJS.columnOffsets.left = -50;
		}
		if (DocsJS.columnOffsets.right < -50){
			DocsJS.columnOffsets.right = -50;
		}
	} else{
		DocsJS.apply(function(doc){
			DocsJS.fontsize._scalar = Math.sqrt(DocsJS.window.width()/(DocsJS.width.min+200));
			doc.style.fontSize = DocsJS.fontsize._value*DocsJS.fontsize._scalar+'px';
			lc.style.width = rc.style.width = rc.style.marginLeft = '0';
			DocsJS.forEach(doc.querySelectorAll('main > [docsjs-tag="s-c"]'),function(el){
				el.style.width = '100%';
				el.style.marginLeft = '0';
			});
		});
	}
	if (DocsJS.cache.initiated && DocsJS.cache.events.oncolumn === 0){
		DocsJS.scrolled();
		DocsJS.apply(function(doc){
			DocsJS.correctColumnHeight(doc);
		});
		DocsJS.cd.refresh();
	}
};
DocsJS._menuClicked = function(el, loc){
	'use strict';
	if (el.offsetParent.parentElement.docsjs.tag === 't-p'){
		el.offsetParent.parentElement.querySelector('[docsjs-tag="button-menu"]').onclick();
		window.setTimeout(function(){
			DocsJS.jumpTo(loc);
		},DocsJS.animation.duration);
	} else{
		DocsJS.jumpTo(loc);
	}
};
DocsJS.bindPrefs = function(){
	'use strict';
	DocsJS.apply(function(doc){
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="aA"]'),function(el){
			el.onclick = function(){
				DocsJS.animate({
					from: DocsJS.fontsize._value,	to: DocsJS.fontsize._value+1,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
					step: function(now){
						DocsJS.fontsize._value = now;
						DocsJS.resized();
						DocsJS.correctColumnHeight(doc);
					},
					callback: DocsJS.scrolled
				});
				DocsJS.events.preferenceChanged('Fontsize up');
			};
			el.onkeyup = function(e){
				var keyCode = e.which || e.keyCode;
				if (keyCode === 32 || keyCode === 13){
					el.onclick();
				}
			};
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="Aa"]'),function(el){
			el.onclick = function(){
				DocsJS.animate({
					from: DocsJS.fontsize._value,	to: DocsJS.fontsize._value-1,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
					step: function(now){
						DocsJS.fontsize._value = now;
						DocsJS.resized();
						DocsJS.correctColumnHeight(doc);
					},
					callback: DocsJS.scrolled
				});
				DocsJS.events.preferenceChanged('Fontsize down');
			};
			el.onkeyup = function(e){
				var keyCode = e.which || e.keyCode;
				if (keyCode === 32 || keyCode === 13){
					el.onclick();
				}
			};
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="O"]'),function(el){
			el.onclick = function(){
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="t-l"]'),function(el){
					if (el.parentElement.docsjs.state === 'max'){
						el.onclick({target:{docsjs:{tag:'t-l'}}});
					}
				});
				window.setTimeout(function(){
					DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="button-minimize"]'),function(el){
						if (el.parentElement.parentElement.parentElement.parentElement.docsjs.state === 'max'){
							el.onclick();
						}
					});
					DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="ebefore"]'),function(el){
						if (el.nextElementSibling.docsjs.state === 'max'){
							el.onclick();
						}
					});
					DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="button-menu"]'),function(el){
						if (el.docsjs.internal === 'menuVisible'){
							el.onclick();
						}
					});
					window.setTimeout(DocsJS.scrolled,DocsJS.animation.duration);
				},DocsJS.animation.duration);
				DocsJS.events.preferenceChanged('Minimize all');
			};
			el.onkeyup = function(e){
				var keyCode = e.which || e.keyCode;
				if (keyCode === 32 || keyCode === 13){
					el.onclick();
				}
			};
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="CM"]'),function(el){
			el.onclick = function(){
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="button-minimize"]'),function(el){
					if (el.parentElement.parentElement.parentElement.parentElement.docsjs.state === 'min'){
						el.onclick();
					}
				});
				window.setTimeout(function(){
					DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="t-l"]'),function(el){
						if (el.parentElement.docsjs.state === 'min'){
							el.onclick({target:{docsjs:{tag:'t-l'}}});
						}
					});
					window.setTimeout(DocsJS.scrolled,DocsJS.animation.duration);
				},DocsJS.animation.duration);
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="button-menu"]'),function(el){
					if (el.docsjs.internal === 'menuVisible'){
						el.onclick();
					}
				});
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="ebefore"]'),function(el){
					if (el.nextElementSibling.docsjs.state === 'max'){
						el.onclick();
					}
				});
				DocsJS.events.preferenceChanged('Minimize half');
			};
			el.onkeyup = function(e){
				var keyCode = e.which || e.keyCode;
				if (keyCode === 32 || keyCode === 13){
					el.onclick();
				}
			};
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="C"]'),function(el){
			el.onclick = function(){
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="button-minimize"]'),function(el){
					if (el.parentElement.parentElement.parentElement.parentElement.docsjs.state === 'min'){
						el.onclick();
					}
				});
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="ebefore"]'),function(el){
					if (el.nextElementSibling.docsjs.state === 'min'){
						el.onclick();
					}
				});
				window.setTimeout(function(){
					DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="t-l"]'),function(el){
						if (el.parentElement.docsjs.state === 'min'){
							el.onclick({target:{docsjs:{tag:'t-l'}}});
						}
					});
					window.setTimeout(DocsJS.scrolled,DocsJS.animation.duration);
				},DocsJS.animation.duration);
				DocsJS.events.preferenceChanged('Minimize none');
			};
			el.onkeyup = function(e){
				var keyCode = e.which || e.keyCode;
				if (keyCode === 32 || keyCode === 13){
					el.onclick();
				}
			};
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="Iv"]'),function(el){
			el.onclick = function(){
				if (doc.style.filter !== 'invert(100%)'){
					DocsJS.animate({
						from: 0,	to: 100,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
						step: function(now){
							doc.style.filter = 'invert('+now+'%)';
							doc.style.WebkitFilter = 'invert('+now+'%)';
							DocsJS.forEach(doc.querySelectorAll('[docsjs-extra="invert"]'),function(el){
								el.style.filter = 'invert('+now+'%)';
								el.style.WebkitFilter = 'invert('+now+'%)';
							});
						}
					});
				} else{
					DocsJS.animate({
						from: 100,	to: 0,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
						step: function(now){
							doc.style.filter = 'invert('+now+'%)';
							doc.style.WebkitFilter = 'invert('+now+'%)';
							DocsJS.forEach(doc.querySelectorAll('[docsjs-extra="invert"]'),function(el){
								el.style.filter = 'invert('+now+'%)';
								el.style.WebkitFilter = 'invert('+now+'%)';
							});
						},
						callback: function(){
							doc.style.filter = '';
							doc.style.WebkitFilter = '';
							DocsJS.forEach(doc.querySelectorAll('[docsjs-extra="invert"]'),function(el){
								el.style.filter = '';
								el.style.WebkitFilter = '';
							});
						}
					});
				}
				DocsJS.events.preferenceChanged('Invert colors');
			};
			el.onkeyup = function(e){
				var keyCode = e.which || e.keyCode;
				if (keyCode === 32 || keyCode === 13){
					el.onclick();
				}
			};
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="GPU"]'),function(el){
			el.onclick = function(){
				if (!DocsJS.cache.fastmode.active){
					DocsJS.cache.fastmode.active = true;
					DocsJS.cache.fastmode.durtation = DocsJS.animation.duration;
					DocsJS.animation.duration = 0;
					DocsJS.forEach(doc.querySelectorAll('[docsjs-extra="gpu"]'),function(el){
						el.style.fontSize = '0.8em';
						el.style.marginTop = '0.125em';
						el.style.marginLeft = '0.125em';
					});
				} else{
					DocsJS.cache.fastmode.active = false;
					DocsJS.animation.duration = DocsJS.cache.fastmode.durtation;
					DocsJS.cache.fastmode.durtation = 0;
					DocsJS.forEach(doc.querySelectorAll('[docsjs-extra="gpu"]'),function(el){
						el.style.fontSize = '1em';
						el.style.marginTop = '0';
						el.style.marginLeft = '0';
					});
				}
				DocsJS.events.preferenceChanged('Lightning');
			};
			el.onkeyup = function(e){
				var keyCode = e.which || e.keyCode;
				if (keyCode === 32 || keyCode === 13){
					el.onclick();
				}
			};
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="Rs"]'),function(el){
			el.onclick = function(){
				if (doc.style.filter === 'none'){
					DocsJS.cache.fastmode.active = false;
					DocsJS.animation.duration = DocsJS.cache.fastmode.durtation;
					DocsJS.cache.fastmode.durtation = 0;
					DocsJS.forEach(doc.querySelectorAll('[docsjs-extra="gpu"]'),function(el){
						el.style.fontSize = '1em';
						el.style.marginTop = '0';
						el.style.marginLeft = '0';
					});
				}
				DocsJS.animate({
					from: DocsJS.columnOffsets.left,	to: 0,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
					step: function(now){
						DocsJS.columnOffsets.left = now;
						DocsJS.resized();
					},
					callback: function(){
						DocsJS.checkColumns(doc);
						DocsJS.scrolled();
					}
				});
				DocsJS.animate({
					from: DocsJS.columnOffsets.right,	to: 0,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
					step: function(now){
						DocsJS.columnOffsets.right = now;
						DocsJS.resized();
					},
					callback: function(){
						DocsJS.checkColumns(doc);
						DocsJS.scrolled();
					}
				});
				DocsJS.animate({
					from: DocsJS.fontsize._value,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
					to: DocsJS.fontsize._init,
					step: function(now){
						DocsJS.fontsize._value = now;
						DocsJS.resized();
					},
					callback: DocsJS.scrolled
				});
				if (doc.style.filter === 'invert(100%)'){
					DocsJS.animate({
						from: 100,	to: 0,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
						step: function(now){
							doc.style.filter = 'invert('+now+'%)';
							doc.style.WebkitFilter = 'invert('+now+'%)';
							DocsJS.forEach(doc.querySelectorAll('[docsjs-extra="invert"]'),function(el){
								el.style.filter = 'invert('+now+'%)';
								el.style.WebkitFilter = 'invert('+now+'%)';
							});
						},
						callback: function(){
							doc.style.filter = '';
							doc.style.WebkitFilter = '';
							DocsJS.forEach(doc.querySelectorAll('[docsjs-extra="invert"]'),function(el){
								el.style.filter = '';
								el.style.WebkitFilter = '';
							});
						}
					});
				}
				DocsJS.forEach(doc.querySelectorAll('[docsjs-internal-default="min"],[docsjs-internal-default="max"]'),function(el){
					if (el.docsjs.internalDefault !== el.docsjs.state){
						switch (el.docsjs.tag){
							case 't-p':
							case 'h-d':
								el.querySelector('[docsjs-tag="t-l"]').onclick({target:{docsjs:{tag:'t-l'}}});
								break;
							case 'e-x':
							case 'e-g':
								el.previousSibling.onclick();
								break;
						}
					}
				});
			};
			DocsJS.events.preferenceChanged('Reset');
		});
	});
};
DocsJS.toggleRecommendedAccessibility = function(el){
	'use strict';
	DocsJS.toggleRecommendedAccessibility = function(){};
	el.parentElement.nextSibling.style.display = '';
	el.parentElement.style.display = 'none';
	DocsJS.fontsize.set(DocsJS.fontsize._value+3);
	DocsJS.apply(function(doc){
		doc.querySelector('[docsjs-pref="C"]').onclick();
		DocsJS.cache.events.columnchoice = 'menu';
		DocsJS.columnOffsets.left = 0.1;
		DocsJS.cache.events.oncolumn = -1;
		DocsJS.checkColumns(doc);
		doc.querySelector('[docsjs-internal="extraWidthCorrect"]').style.display = 'none';
		doc.querySelector('[docsjs-tag="column-handle"]').style.display = 'none';
		doc.querySelector('[docsjs-tag="column-right"]').style.display = 'none';
		doc.querySelector('[docsjs-tag="column-left"]').style.width = parseInt(doc.querySelector('[docsjs-tag="column-left"]').style.width)*2+'px';
		DocsJS.forEach(doc.querySelectorAll('main>[docsjs-tag="s-c"]'),function(el){
			el.style.marginLeft = parseInt(el.style.marginLeft)*2+'px';
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="aA"]'),function(el){
			el.onclick = function(){
				DocsJS.fontsize._value++;
				doc.style.fontSize = DocsJS.fontsize._value+'px';
				DocsJS.events.preferenceChanged('Fontsize up');
			};
			el.onkeyup = function(e){
				var keyCode = e.which || e.keyCode;
				if (keyCode === 32 || keyCode === 13){
					el.onclick();
				}
			};
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="Aa"]'),function(el){
			el.onclick = function(){
				DocsJS.fontsize._value--;
				doc.style.fontSize = DocsJS.fontsize._value+'px';
				DocsJS.events.preferenceChanged('Fontsize down');
			};
			el.onkeyup = function(e){
				var keyCode = e.which || e.keyCode;
				if (keyCode === 32 || keyCode === 13){
					el.onclick();
				}
			};
		});
		window.setTimeout(function(){
			DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="button-minimize"],[docsjs-tag="button-menu"]'),function(el){
				el.style.display = 'none';
			});
			DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="t-l"],[docsjs-tag="ebefore"]'),function(el){
				el.onclick = function(){};
				el.onkeyup = function(){};
			});
		},1000);
	});
	DocsJS.resized = function(){};
};
DocsJS.toggleExtendedAccessibility = function(){
	'use strict';
	DocsJS.toggleExtendedAccessibility = function(){};
	DocsJS.apply(function(doc){
		doc.innerHTML = DocsJS.cache.accessibility;
		doc.querySelector('[docsjs-tag="accessibility-mode-content"]').removeChild(doc.querySelector('[docsjs-tag="accessibility-button"]'));
		doc.querySelector('[docsjs-tag="accessibility-mode-content"]').removeChild(doc.querySelector('[docsjs-tag="accessibility-button"]'));
	});
};
DocsJS.accessButtonSpaceClick = function(el, e){
	'use strict';
	var keyCode = e.which || e.keyCode;
	if (keyCode === 32 || keyCode === 13){
		el.onclick();
	}
};
DocsJS.spaceClick = function(el, e){
	'use strict';
	var keyCode = e.which || e.keyCode;
	if (keyCode === 32 || keyCode === 13){
		DocsJS.jumpTo(el.getAttribute('onclick').split("DocsJS.jumpTo('")[1].slice(0,-2));
	}
};

//////////////////////
////// Sidebars //////
//////////////////////

DocsJS.checkColumns = function(doc){
	'use strict';
	if (DocsJS.columnOffsets.left > 0 && DocsJS.column.state[0] === 'none'){
		doc.querySelector('[docsjs-tag="column-left"]').innerHTML = DocsJS.column.generate(DocsJS.cache.events.columnchoice,doc);
		doc.querySelector('[docsjs-tag="column-left"]').lastChild.style.marginLeft = '-'+(100+DocsJS.cache.extraWidth)+'px';
		if (DocsJS.cache.events.columnchoice !== 'menu'){
			doc.querySelector('[docsjs-tag="column-left"]').style.position = 'absolute';
		} else{
			DocsJS.bindPrefs();
		}
		DocsJS.column.state[0] = DocsJS.cache.events.columnchoice;
		DocsJS.cache.events.columnchoice = 0;
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="column-left"] [docsjs-tag="e-g"],[docsjs-tag="column-left"] [docsjs-tag="e-x"]'),function(el){
			el.style.height = el.style.paddingTop = el.style.paddingBottom = el.style.borderTopWidth = el.style.borderBottomWidth = '';
		});
		
		DocsJS.correctColumnHeight(doc);
		DocsJS.cd.refresh();
	} else if (DocsJS.columnOffsets.left <= 0 && DocsJS.column.state[0] !== 'none'){
		if (DocsJS.column.state[0] !== 'menu'){
			var nodesL = [];
			DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="'+DocsJS.column.state[0]+'-inactive"]'),function(el){
				el.docsjs.tag = 'ebefore';
				el.style.display = '';
				nodesL.push(el.nextSibling);
			});
			DocsJS.forEach(doc.querySelector('[docsjs-tag="column-left"]').querySelectorAll('[docsjs-tag="'+DocsJS.column.state[0]+'"]'),function(el,index){
				nodesL[index].parentElement.insertBefore(el,nodesL[index]);
			});
			DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="efiller"][docsjs-side="left"]'),function(el){
				el.style.height = '0px';
			});
		}
		doc.querySelector('[docsjs-tag="column-left"]').style.position = 'fixed';
		doc.querySelector('[docsjs-tag="column-left"]').innerHTML = DocsJS.column.choice(-1);
		DocsJS.column.state[0] = 'none';
		DocsJS.cache.events.columnchoice = 0;
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="s-c"] [docsjs-tag="e-g"],[docsjs-tag="s-c"] [docsjs-tag="e-x"]'),function(el){
			if (el.docsjs.state === 'min'){
				el.style.height = el.style.paddingTop = el.style.paddingBottom = el.style.borderTopWidth = el.style.borderBottomWidth = '0px';
			}
		});
		DocsJS.cd.refresh();
	}
	if (DocsJS.columnOffsets.right > 0 && DocsJS.column.state[1] === 'none'){
		doc.querySelector('[docsjs-tag="column-right"]').style.position = 'absolute';
		doc.querySelector('[docsjs-tag="column-right"]').innerHTML = DocsJS.column.generate(DocsJS.cache.events.columnchoice,doc);
		doc.querySelector('[docsjs-tag="column-right"]').lastChild.style.marginRight = '-'+(100+DocsJS.cache.extraWidth)+'px';
		DocsJS.column.state[1] = DocsJS.cache.events.columnchoice;
		if (DocsJS.column.state[0] === 'none'){
			doc.querySelector('[docsjs-tag="column-left"]').innerHTML = DocsJS.column.choice(-1);
		}
		DocsJS.cache.events.columnchoice = 0;
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="column-right"] [docsjs-tag="e-g"],[docsjs-tag="column-right"] [docsjs-tag="e-x"]'),function(el){
			el.style.height = el.style.paddingTop = el.style.paddingBottom = el.style.borderTopWidth = el.style.borderBottomWidth = '';
		});
		DocsJS.correctColumnHeight(doc);
		DocsJS.cd.refresh();
	} else if (DocsJS.columnOffsets.right <= 0 && DocsJS.column.state[1] !== 'none'){
		var nodesR = [];
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="'+DocsJS.column.state[1]+'-inactive"]'),function(el){
			el.docsjs.tag = 'ebefore';
			el.style.display = '';
			nodesR.push(el.nextSibling);
		});
		DocsJS.forEach(doc.querySelector('[docsjs-tag="column-right"]').querySelectorAll('[docsjs-tag="'+DocsJS.column.state[1]+'"]'),function(el,index){
			nodesR[index].parentElement.insertBefore(el,nodesR[index]);
		});
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="efiller"][docsjs-side="right"]'),function(el){
			el.style.height = '0px';
		});
		doc.querySelector('[docsjs-tag="column-right"]').style.position = 'fixed';
		doc.querySelector('[docsjs-tag="column-right"]').innerHTML = DocsJS.column.choice(1);
		DocsJS.column.state[1] = 'none';
		if (DocsJS.column.state[0] === 'none'){
			doc.querySelector('[docsjs-tag="column-left"]').innerHTML = DocsJS.column.choice(-1);
		}
		DocsJS.cache.events.columnchoice = 0;
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="s-c"] [docsjs-tag="e-g"],[docsjs-tag="s-c"] [docsjs-tag="e-x"]'),function(el){
			if (el.docsjs.state === 'min'){
				el.style.height = el.style.paddingTop = el.style.paddingBottom = el.style.borderTopWidth = el.style.borderBottomWidth = '0px';
			}
		});
		DocsJS.cd.refresh();
	}
	if (DocsJS.cache.events.columnchoice !== 0){
		var drag = document.createElement('div');
		drag.style.position = 'absolute';
		drag.style.top = 0;
		drag.style.opacity = 0;
		drag.style.height = '100%';
		drag.style.width = '100%';
		drag.style.pointerEvents = 'none';
		drag.setAttribute('docsjs-tag','column-filler');
		drag.innerHTML = '<div style="position:absolute;line-height:50px;top:50%;margin-top:-25px;width:100%;text-align:center;font-size:25px;white-space:nowrap;"><span style="display:inline-block;">&gt;</span> Drag <span style="display:inline-block;">&gt;</span></div>';
		DocsJS.rotate(drag.firstChild,(DocsJS.cache.events.oncolumn===1?90:90));
		DocsJS.rotate(drag.firstChild.querySelectorAll('span')[0],(DocsJS.cache.events.oncolumn===1?90:270));
		DocsJS.rotate(drag.firstChild.querySelectorAll('span')[1],(DocsJS.cache.events.oncolumn===1?90:270));
		doc.querySelector('[docsjs-tag="column-'+(DocsJS.cache.events.oncolumn===1?'right':'left')+'"]').appendChild(drag);
		DocsJS.animate({
			from: -2, to: 2, duration: DocsJS.animation.duration*4, easing: DocsJS.easings.linear,
			step: function(now){
				drag.style.opacity = 2-Math.abs(now);
			},
			callback: function(){
				drag.parentNode.removeChild(drag);
			}
		});
	}
};
DocsJS.column = {
	handle: function(n){
		'use strict';
		return '<div docsjs-tag="column-handle" onmousedown="DocsJS.cache.events.oncolumn = '+n+';" ontouchstart="DocsJS.cache.events.oncolumn = '+n+';"><div docsjs-tag="column-handle-inner"></div></div>';
	},
	choice: function(n){
		'use strict';
		var button = function(name){
			var div = document.createElement('div');
			div.innerHTML = '<div style="position:absolute;height:35px;width:35px;font-size:35px;top:0;bottom:0;margin-top:auto;margin-bottom:auto;left:0;right:0;margin-left:auto;margin-right:auto;">'+DocsJS.buttons[name].html()+'</div>';
			if (n === 1){
				DocsJS.rotate(div.firstChild,180);
			}
			return div.outerHTML;
		};
		var mouseevents = function(name){
			return 'onmousedown="DocsJS.cache.events.oncolumn = '+n+'; DocsJS.cache.events.columnchoice = '+"'"+name+"'"+';" ontouchstart="DocsJS.cache.events.oncolumn = '+n+'; DocsJS.cache.events.columnchoice = '+"'"+name+"'"+';"  onmouseover="this.docsjs.tag='+"'column-content'"+'" onmouseout="this.docsjs.tag='+"'column-filler'"+'"';
		};
		var tabs = {
			eg: '<div docsjs-tag="column-filler" style="height:50%; overflow:hidden; cursor:pointer; cursor:ew-resize;"'+mouseevents('e-g')+'>'+button('eg')+'</div>',
			ex: '<div docsjs-tag="column-filler" style="height:50%; overflow:hidden; cursor:pointer; cursor:ew-resize;"'+mouseevents('e-x')+'>'+button('ex')+'</div>',
			menuHalf: '<div docsjs-tag="column-filler" style="height:50%; overflow:hidden; cursor:pointer; cursor:ew-resize;"'+mouseevents('menu')+'>'+button('menu')+'</div>',
			menuFull: '<div docsjs-tag="column-filler" style="height:100%; overflow:hidden; cursor:pointer; cursor:ew-resize;"'+mouseevents('menu')+'>'+button('menu')+'</div>',
		};
		if (n === -1){
			if (DocsJS.column.state[1] === 'e-g'){
				return tabs.menuHalf + tabs.ex;
			} else if (DocsJS.column.state[1] === 'e-x'){
				return tabs.menuHalf + tabs.eg;
			} else{
				return tabs.menuFull;
			}
		} else{
			return tabs.eg + tabs.ex;
		}
	},
	generate: function(type, doc){
		'use strict';
		var out = '';
		if (type === 'menu'){
			out = doc.querySelector('[docsjs-tag="menu"]').cloneNode(true);
			out.style.display = '';
			out = '<div docsjs-tag="column-content" style="height:100%; overflow: auto; -webkit-overflow-scrolling: touch;" role="navigation">'+out.outerHTML+'</div>';
		} else{
			var lastLocation = '-1';
			DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="'+type+'"]'),function(el){
				var sameTopic = false;
				var currentLocation = el.parentElement.docsjs.location || el.parentElement.parentElement.docsjs.location;
				if (currentLocation !== lastLocation){
					lastLocation = currentLocation;
				} else{
					sameTopic = true;
					lastLocation = currentLocation;
				}
				el.previousSibling.style.display = 'none';
				el.previousSibling.docsjs.tag = type+"-inactive";
				var div = document.createElement('div');
				div.setAttribute('docsjs-tag','column-content');
				div.innerHTML = el.previousSibling.innerText !== DocsJS[type.replace('-','')].name? '<div docsjs-tag="etitle">'+el.previousSibling.textContent+'<div>' : '<div docsjs-tag="etitle">'+DocsJS[type.replace('-','')].name+'<div>';
				div.appendChild(el);
				var wrap = document.createElement('div');
				wrap.appendChild(div);
				if (!sameTopic){
					out += '<div docsjs-tag="column-filler"></div>'+wrap.innerHTML;
				} else{
					out = out.slice(0, -6);
					out += div.innerHTML+'</div>';
				}
			});
			out += '<div docsjs-tag="column-filler"></div>';
		}
		return out+DocsJS.column.handle(DocsJS.cache.events.oncolumn)+'<div docsjs-tag="column-filler" docsjs-internal="extraWidthCorrect" style="position:fixed;width:'+(100+DocsJS.cache.extraWidth)+'px;min-height:100%;left:0;right:0;margin-left:auto;margin-right:auto;top:0;"><div style="position:absolute; font-size: 30px; width:30px;height:30px;left:0;top:0;right:0;bottom:0;margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;">'+DocsJS.buttons.close()+'</div></div>';
	},
	state: ['none','none']
};
DocsJS.correctColumnHeight = function(doc){
	'use strict';
	var correct = function(side){
		var scrollTop = DocsJS.window.scrollTop();
		DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="efiller"][docsjs-side="'+side+'"],[docsjs-tag="column-'+side+'"] [docsjs-tag="column-filler"]'),function(el){
			el.style.height = '0px';
		});
		var checkVisible = function(el){
			el = el.parentElement;
			if (el.docsjs.tag !== undefined){
				if (el.docsjs.state === 'min'){
					columnBox.previousSibling.style.display = 'none';
					columnBox.style.display = 'none';
				} else if (el.docsjs.tag !== DocsJS.superparent){
					checkVisible(el);
				}
			} else{
				checkVisible(el);
			}
		};
		var offset = 0;
		var lastLocation = '-1';
		for (var i = 0; i < doc.querySelectorAll('[docsjs-tag="column-'+side+'"]>[docsjs-tag="column-content"]').length; i++){
			var columnBox = doc.querySelectorAll('[docsjs-tag="column-'+side+'"]>[docsjs-tag="column-content"]')[i];
			var centerBox = doc.querySelectorAll('[docsjs-tag="'+(DocsJS.column.state[(side === 'left'? 0:1)])+'-inactive"]')[i+offset].parentElement;
			var currentLocation = centerBox.docsjs.location || centerBox.parentElement.docsjs.location;
			if (lastLocation !== currentLocation){
				lastLocation = currentLocation;
			} else{
				offset++;
				centerBox = doc.querySelectorAll('[docsjs-tag="'+(DocsJS.column.state[(side === 'left'? 0:1)])+'-inactive"]')[i+offset].parentElement;
			}
			columnBox.previousSibling.style.display = '';
			columnBox.style.display = '';
			columnBox.style.maxHeight = '';
			columnBox.previousSibling.style.height = centerBox.getBoundingClientRect().top-columnBox.getBoundingClientRect().top + 'px';
			centerBox.querySelector('[docsjs-tag="efiller"][docsjs-side="'+side+'"]').style.height = columnBox.getBoundingClientRect().bottom-centerBox.getBoundingClientRect().bottom + 'px';
			if (columnBox.getBoundingClientRect().bottom-centerBox.getBoundingClientRect().bottom > 0){
				var maxed = columnBox.clientHeight+centerBox.getBoundingClientRect().bottom-columnBox.getBoundingClientRect().bottom-parseFloat(DocsJS.getStyle(columnBox,'padding-top'))-parseFloat(DocsJS.getStyle(columnBox,'padding-bottom'));
				if (maxed < 0){
					columnBox.style.display = 'none';
				} else{
					columnBox.style.maxHeight = maxed + 'px';
				}
			}
			checkVisible(centerBox);
		}
		doc.querySelector('[docsjs-tag="column-'+side+'"]').lastChild.previousSibling.previousSibling.style.height = doc.getBoundingClientRect().bottom - doc.querySelector('[docsjs-tag="column-'+side+'"]').lastChild.previousSibling.previousSibling.getBoundingClientRect().bottom +  'px';
		window.scroll(0,scrollTop);
	};
	if (DocsJS.column.state[0] !== 'none' && DocsJS.column.state[0] !== 'menu'){
		correct('left');
	}
	if (DocsJS.column.state[1] !== 'none'){
		correct('right');
	}
};

//////////////////////
///// Callables //////
//////////////////////

DocsJS.animate = function(arg){
	'use strict';
	switch (undefined){
		case arg.to:
			console.error('DocsJS Animation Error: needs argument "to"');
			return;
		case arg.from:
			console.error('DocsJS Animation Error: needs argument "from"');
			return;
		case arg.duration:
			console.error('DocsJS Animation Error: needs argument "duration"');
			return;
		case arg.step:
			console.error('DocsJS Animation Error: needs argument "step"');
			return;
	}
	if (arg.easing === undefined){
		arg.easing = DocsJS.easings.linear;
	}
	if (arg.callback === undefined){
		arg.callback = function(){};
	}
	arg.delta = arg.to - arg.from;
	if (arg.delta !== 0 && !isNaN(arg.delta)){
		var start = Date.now();
		var loop = function(){
			var scalar = arg.easing((Date.now()-start)/arg.duration);
			if (Date.now()-start < arg.duration){
				arg.step(arg.from+arg.delta*scalar, arg.pass);
				window.setTimeout(loop,1);
			} else{
				arg.step(arg.from+arg.delta, arg.pass);
				arg.callback(arg.pass);
			}
		};
		loop();
	} else{
		if (isNaN(arg.delta)){
			console.error('DocsJS Animation Error: given argument to('+arg.to+') minus given argument from('+arg.from+') is not a number.');
		}
	}
};
DocsJS.jumpTo = function(location){
	'use strict';
	if (location === DocsJS.menu.top){
		var scrollTimeT = Math.sqrt(DocsJS.window.scrollTop())/14*DocsJS.animation.duration;
		DocsJS.animate({
			from: DocsJS.window.scrollTop(),
			to: 0,
			duration: scrollTimeT, easing: DocsJS.easings.easeOutQuart,
			step: function(now){
				window.scroll(0,now);
			}
		});
		DocsJS.events.jumpTo('top');
	} else if (location === DocsJS.menu.bottom){
		var btm = document.querySelector('[docsjs-tag="'+DocsJS.superparent+'"]').clientHeight - DocsJS.window.height();
		var scrollTimeB = Math.sqrt(btm - DocsJS.window.scrollTop())/14*DocsJS.animation.duration;
		DocsJS.animate({
			from: DocsJS.window.scrollTop(),
			to: btm,
			duration: scrollTimeB, easing: DocsJS.easings.easeOutQuart,
			step: function(now){
				window.scroll(0,now);
			}
		});
		DocsJS.events.jumpTo('bottom');
	} else{
		try {
			var loc = location.split('.');
			var dest = document.querySelectorAll('[docsjs-tag="'+DocsJS.superparent+'"]')[loc[0]].querySelector('main');
			loc.shift();
			for (var i = 0; i < loc.length; i++){
				var children = dest.querySelectorAll('[docsjs-tag="s-c"],[docsjs-tag="t-p"]');
				var immeditateChildren = [];
				for (var j = 0; j < children.length; j++){
					if (children[j].parentElement === dest){
						immeditateChildren.push(children[j]);
					}
				}
				dest = immeditateChildren[loc[i]];
			}
			dest = dest.querySelector('[docsjs-tag="h-d"]') || dest;
			var scrollTo = dest.getBoundingClientRect().top - document.body.getBoundingClientRect().top - DocsJS.fontsize._value*DocsJS.fontsize._scalar;
			if (document.querySelector('[docsjs-tag="'+DocsJS.superparent+'"]').clientHeight - DocsJS.window.height() < scrollTo){
				scrollTo = Math.min(scrollTo, document.querySelector('[docsjs-tag="'+DocsJS.superparent+'"]').clientHeight - DocsJS.window.height());
			}
			var scrollTime = Math.sqrt(Math.abs(DocsJS.window.scrollTop() - scrollTo))/14*DocsJS.animation.duration;
			DocsJS.animate({
				from: DocsJS.window.scrollTop(),
				to: scrollTo,
				duration: scrollTime, easing: DocsJS.easings.easeOutQuart,
				step: function(now){
					window.scroll(0,now);
				}
			});
			DocsJS.events.jumpTo(loc);
		} catch(e){
			var names = document.querySelectorAll('[docsjs-tag="menu-title"]');
			for (var n = 0; n < names.length; n++){
				if (names[n].innerText.replace(/(\r\n|\n|\r)/gm,'') === location){
					DocsJS.jumpTo(names[n].docsjs.menuLocation);
					return;
				}
			}
		}
	}
};
DocsJS.toggle = function(el, target){
	'use strict';
	switch (target){
		case 'max':
			target = 'min';
			break;
		case 'min':
			target = 'max';
			break;
		case undefined:
			target = el.docsjs.state;
			break;
	}
	if (el.docsjs.state === target){
		switch (el.docsjs.tag){
			case 's-c':
				el.querySelector('[docsjs-tag="h-d"]').querySelector('[docsjs-tag="t-l"]').querySelector('[docsjs-tag="button-minimize"]').onclick();
				break;
			case 'h-d':
			case 't-p':
				el.querySelector('[docsjs-tag="t-l"]').onclick({target:{docsjs:{tag:'t-l'}}});
				break;
			case 'e-x':
			case 'e-g':
				el.previousSibling.onclick();
				break;
		}
	}
};
DocsJS.rotate = function(el, deg){
	'use strict';
	var rad = deg*0.0174533;
	var msFilter = "progid:DXImageTransform.Microsoft.Matrix(M11="+Math.cos(rad)+", M12="+-1*Math.sin(rad)+", M21="+Math.sin(rad)+", M22="+Math.cos(rad)+", SizingMethod='auto expand')";
	el.style.WebkitTransform = 'rotate('+deg+'deg)';
	el.style.msTransform = 'rotate('+deg+'deg)';
	el.style.transform = 'rotate('+deg+'deg)';
	el.style.filter = msFilter;
	el.style.msFilter = "'"+msFilter+"'";
};
DocsJS.addEvent = function(obj, type, fn, options){
	'use strict';
	if (options === undefined){
		options = {};
	}
	if ( obj.attachEvent ) {
		obj['e'+type+fn] = fn;
		obj[type+fn] = function(){obj['e'+type+fn]( window.event );};
		obj.attachEvent( 'on'+type, obj[type+fn] );
	} else{
		obj.addEventListener(type, fn, options);
	}
};
DocsJS.removeEvent = function (obj, type, fn, options){
	'use strict';
	if (options === undefined){
		options = {
			passive: true
		};
	}
	if ( obj.detachEvent ) {
		obj.detachEvent('on'+type, obj[type+fn]);
		obj[type+fn] = null;
	} else{
		obj.removeEventListener(type, fn, options);
	}
};
DocsJS.getStyle = function (el, prop){
	'use strict';
	if (typeof getComputedStyle !== 'undefined'){
		return getComputedStyle(el, null).getPropertyValue(prop);
	} else{
		prop = prop.split('-');
		for (var i = 1; i < prop.length; i++){
			prop[i] = prop[i].charAt(0).toUpperCase() + prop[i].slice(1);
		}
		return el.currentStyle[prop.join('')];
	}
};
DocsJS.fontsize = {
	set: function(val){
		'use strict';
		DocsJS.fontsize._value = val;
		if (DocsJS.cache.initiated){
			DocsJS.resized();
			DocsJS.scrolled();
			DocsJS.apply(function(doc){
				DocsJS.correctColumnHeight(doc);
			});
		}
	},
	_value: 22,
	_scalar: 1,
	_init: undefined
};
DocsJS.window = {
	width: function(){
		'use strict';
		return window.clientWidth || document.documentElement.clientWidth || document.body.clientWidth;
	},
	height: function(){
		'use strict';
		return window.clientWidth || document.documentElement.clientHeight || document.body.clientHeight;
	},
	scrollTop: function(){
		'use strict';
		return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	}
};

//////////////////////
///// Settables //////
//////////////////////

DocsJS.theme = null;
DocsJS.superparent = 'DocsJS-This-Baby';
DocsJS.width = {
	max: 1280,
	min: 340
};
DocsJS.animation = {
	duration: 300
};
DocsJS.columnOffsets = {
	left: 0,
	right: 0
};
DocsJS.eg = {
	name: 'Example',
	defaultState: 'min'
};
DocsJS.ex = {
	name: 'More',
	defaultState: 'min'
},
DocsJS.cd = {
	theme: undefined,
	tabSize: 4,
	editable: false,
	options: function(editor, editable){
		'use strict';
		if (editor === 'Ace editor object'){}
		if (editable === true){} else if (editable === false){}
	},
	getEditor: function(el){
		'use strict';
		return DocsJS.cache.aceEditors[el.docsjs.internal];
	},
	refresh: function(callback){
		'use strict';
		if (typeof ace !== 'undefined' && DocsJS.supports.ace){
			DocsJS.apply(function(doc){
				var editors = [];
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="c-d"]'),function(el, index){
					if (el.docsjs.internal !== undefined){
						el.innerHTML = DocsJS.cache.aceEditors[el.docsjs.internal].getValue().replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
							return '&#'+i.charCodeAt(0)+';';
						});
						el.docsjs.internal = index;
						DocsJS.cache.aceEditors[el.docsjs.internal].setTheme("ace/theme/"+(DocsJS.cd.theme || DocsJS.aceTheme[DocsJS.theme] || 'chrome'));
						DocsJS.cache.aceEditors[el.docsjs.internal].destroy();
						el.docsjs.internal = index;
					} else{
						el.setAttribute('docsjs-internal',index);
					}
				});
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="c-d"]'),function(el){
					el.style.fontSize = '0.8em';
					var editor = ace.edit(el);
					editor.setTheme("ace/theme/"+(DocsJS.cd.theme || DocsJS.aceTheme[DocsJS.theme]));
					editor.getSession().setMode("ace/mode/"+el.docsjs.lang);
					editor.getSession().setTabSize(DocsJS.cd.tabSize);
					if (!(el.docsjs.editable === undefined? DocsJS.cd.editable : JSON.parse(el.docsjs.editable))){
						editor.setReadOnly(true);
						editor.renderer.setShowGutter(false);
						editor.renderer.setPadding(parseInt(DocsJS.getStyle(document.querySelector('[docsjs-tag="'+DocsJS.superparent+'"]'),'font-size')));
						editor.renderer.$cursorLayer.element.style.display = "none";
						editor.setShowPrintMargin(false);
						el.querySelector('textarea').setAttribute('aria-hidden','true');
						el.querySelector('textarea').setAttribute('aria-label','Disabled textarea');
						DocsJS.cd.options(editor, false);
					} else{
						editor.setReadOnly(false);
						el.querySelector('textarea').setAttribute('tabindex','-1');
						el.querySelector('textarea').setAttribute('aria-label','Edit code');
						DocsJS.cd.options(editor, true);
					}
					el.style.height = (editor.getSession().getDocument().getLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth())/DocsJS.fontsize._value/DocsJS.fontsize._scalar*1.25 + 'em';
					editors.push(editor);
				});
				DocsJS.cache.aceEditors = editors;
			});
			DocsJS.events.cdRefreshed();
			if (typeof callback === 'function'){
				callback();
			}
		}
	}
};
DocsJS.menu = {
	top: 'Jump to top',
	bottom: 'Jump to bottom'
};
DocsJS.events = {
	ready: function(){},
	columnResize: function(side){'use strict';if (side === "left"){} else if (side === "right"){}},
	sectionToggle: function(section){'use strict';if (section === 'HTML Node of (un)minimized section'){}},
	topicToggle: function(topic){'use strict';if (topic === 'HTML Node of (un)minimized header or topic'){}},
	menuToggle: function(menu){'use strict';if (menu === 'HTML Node of menu opened/closed'){}},
	eToggle: function(e){'use strict';if (e === 'HTML Node of ex/eg opened/closed'){}},
	cdRefreshed: function(e){'use strict';if (e === 'DocsJS.cd.refresh() has been called and finished.'){}},
	preferenceChanged: function(type){'use strict';if (type === 'The preference changed: Fontsize up || Fontisze down || Minimize all || Minimize half || Minimize none || Invert colors || Lightning || Reset'){}},
	jumpTo: function(location){'use strict';if (location === 'top || bottom || period-separated location'){}},
};
DocsJS.buttons = {
	minimize: {
		html: function(){
			'use strict';
			return '<div docsjs-tag="button-parent"><div style="position: absolute; height: 100%; width: 100%; -ms-filter: '+"'progid:DXImageTransform.Microsoft.Matrix(M11=0.4999999999999997, M12=0.8660254037844388, M21=-0.8660254037844388, M22=0.4999999999999997, SizingMethod='auto expand')'"+';filter: progid:DXImageTransform.Microsoft.Matrix(M11=0.4999999999999997,M12=0.8660254037844388,M21=-0.8660254037844388,M22=0.4999999999999997,SizingMethod='+"'auto expand'"+');-o-transform: rotate(-60deg);-moz-transform: rotate(-60deg);-webkit-transform: rotate(-60deg);transform: rotate(-60deg);"><div style="position: absolute; width: 100%; height: 50%; overflow: hidden;"><div docsjs-tag="button-child" style="background-color: transparent; width: 100%; height: 200%; border-radius: 10000000px; top: 100%;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;*behavior: url(https://raw.github.com/Schepp/box-sizing-polyfill/master/boxsizing.htc);"></div></div></div><div style="position: absolute; width: 100%; height: 50%; top: 50%; overflow: hidden;"><div docsjs-tag="button-child" style="background-color: transparent; width: 100%; height: 200%; border-radius: 10000000px; top: -100%;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;*behavior: url(https://raw.github.com/Schepp/box-sizing-polyfill/master/boxsizing.htc);"></div></div></div>';
		},
		animation: function(button, now){
			'use strict';
			DocsJS.rotate(button.firstChild, (1-now)*60 - 60);
			DocsJS.rotate(button, (1-now)*60);
		}
	},
	menu: {
		html: function(){
			'use strict';
			return '<div docsjs-tag="button-parent" name="menu"><div docsjs-tag="button-child" style="width: 100%; border: none; margin-top: 25%;"></div><div docsjs-tag="button-child" style="width: 100%; border: none; margin-bottom: 25%;"></div></div>';
		},
		animation: function(button, now){
			'use strict';
			button.firstChild.style.marginTop = (25+25*now)-(button.firstChild.offsetHeight/button.clientHeight*50)*now+'%';
			button.lastChild.style.marginBottom = (25+25*now)-(button.lastChild.offsetHeight/button.clientHeight*50)*now+'%';
			DocsJS.rotate(button.firstChild, now*45);
			DocsJS.rotate(button.lastChild, now*135);
		}
	},
	ex: {
		html: function(){
			'use strict';
			return '<div docsjs-tag="button-parent"><div style="position: absolute; margin-left: -10%; height: 100%; width: 100%;"><div docsjs-tag="button-child" style="height: 70%; width: 70%; background-color: transparent; -ms-filter: '+"'progid:DXImageTransform.Microsoft.Matrix(M11=0.7071067811865474,M12=-0.7071067811865477,M21=0.7071067811865477, M22=0.7071067811865474,SizingMethod='auto expand')'"+';filter: progid:DXImageTransform.Microsoft.Matrix(M11=0.7071067811865474,M12=-0.7071067811865477,M21=0.7071067811865477,M22=0.7071067811865474,SizingMethod='+"'auto expand'"+');-o-transform: rotate(45deg);-moz-transform: rotate(45deg);-webkit-transform: rotate(45deg);transform: rotate(45deg); -webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;*behavior: url(https://raw.github.com/Schepp/box-sizing-polyfill/master/boxsizing.htc); border-radius: 0; border-bottom: none; border-left: none;"></div><div docsjs-tag="button-child" style="margin-left: 20%; -webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;*behavior: url(https://raw.github.com/Schepp/box-sizing-polyfill/master/boxsizing.htc); border-radius: 100%;"></div><div docsjs-tag="button-child" style="margin-right: 35%;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;*behavior: url(https://raw.github.com/Schepp/box-sizing-polyfill/master/boxsizing.htc); border-radius: 100%;"></div></div></div>';
		},
		animation: function(button, now){
			'use strict';
			DocsJS.rotate(button,90*now);
		}
	},
	eg: {
		html: function(){
			'use strict';
			return '<div docsjs-tag="button-parent"><div style="position: absolute; margin-left: -10%; height: 100%; width: 100%;"><div docsjs-tag="button-child" style="height: 70%; width: 70%; background-color: transparent; -ms-filter:'+" 'progid:DXImageTransform.Microsoft.Matrix(M11=0.7071067811865474,M12=-0.7071067811865477,M21=0.7071067811865477, M22=0.7071067811865474,SizingMethod='auto expand')'"+';filter: progid:DXImageTransform.Microsoft.Matrix(M11=0.7071067811865474,M12=-0.7071067811865477,M21=0.7071067811865477,M22=0.7071067811865474,SizingMethod='+"'auto expand'"+');-o-transform: rotate(45deg);-moz-transform: rotate(45deg);-webkit-transform: rotate(45deg);transform: rotate(45deg); -webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;*behavior: url(https://raw.github.com/Schepp/box-sizing-polyfill/master/boxsizing.htc); border-radius: 0; border-bottom: none; border-left: none;"></div><div docsjs-tag="button-child" style="width: 60%; margin-right: 5%; border-bottom: none; height: 0; border-radius: 0;"></div></div></div>';
		},
		animation: function(button, now){
			'use strict';
			DocsJS.rotate(button,90*now);
		}
	},
	close: function(){
		'use strict';
		return '<div docsjs-tag="button-parent"><div docsjs-tag="button-child" style="height: 100%; border: none; -ms-filter: '+"'progid:DXImageTransform.Microsoft.Matrix(M11=0.7071067811865474,M12=-0.7071067811865477,M21=0.7071067811865477,M22=0.7071067811865474,SizingMethod='auto expand')';filter: progid:DXImageTransform.Microsoft.Matrix(M11=0.7071067811865474,M12=-0.7071067811865477,M21=0.7071067811865477,M22=0.7071067811865474,SizingMethod='auto expand'"+');-o-transform: rotate(45deg);-moz-transform: rotate(45deg);-webkit-transform: rotate(45deg);transform: rotate(45deg);"></div><div docsjs-tag="button-child" style="width: 100%; border: none; -ms-filter: '+"'progid:DXImageTransform.Microsoft.Matrix(M11=0.7071067811865474,M12=-0.7071067811865477,M21=0.7071067811865477, M22=0.7071067811865474,SizingMethod='auto expand')';filter: progid:DXImageTransform.Micrxosoft.Matrix(M11=0.7071067811865474,M12=-0.7071067811865477,M21=0.7071067811865477,M22=0.7071067811865474,SizingMethod='auto expand'"+');-o-transform: rotate(45deg);-moz-transform: rotate(45deg);-webkit-transform: rotate(45deg);transform: rotate(45deg);"></div></div>';
	},
	fontplus: function(){
		'use strict';
		return '<div docsjs-tag="button-parent"><p docsjs-tag="button-child" style="border: none; height: 100%; width: 100%; background: none; text-align: center; font-size:1.25em; line-height: 0.8em;">A</p></div>';
	},
	fontminus: function(){
		'use strict';
		return '<div docsjs-tag="button-parent"><p docsjs-tag="button-child" style="border: none; height: 100%; width: 100%; background: none; text-align: center; font-size:0.8em; line-height: 1.25em;">A</p></div>';
	},
	menuminimize: function(){
		'use strict';
		return DocsJS.buttons.minimize.html();
	},
	partialminimize: function(){
		'use strict';
		var out = document.createElement('div');
		out.innerHTML = DocsJS.buttons.minimize.html();
		DocsJS.buttons.minimize.animation(out.firstChild,0.7);
		return out.innerHTML;
	},
	menuminimized: function(){
		'use strict';
		var out = document.createElement('div');
		out.innerHTML = DocsJS.buttons.minimize.html();
		DocsJS.buttons.minimize.animation(out.firstChild,0);
		return out.innerHTML;
	},
	invert: function(){
		'use strict';
		var out = document.createElement('div');
		out.innerHTML = '<div docsjs-tag="button-parent" docsjs-extra="invert"><div style="position: absolute; width: 100%; height: 100%; overflow: hidden; filter: invert(100%); -webkit-filer: invert(100%);"><div docsjs-tag="button-child" style="width: 100%; height: 100%; border-radius: 10000000px; border: none;"></div></div><div style="position: absolute; width: 100%; height: 50%; top: 50%; overflow: hidden;"><div docsjs-tag="button-child" style="width: 100%; height: 200%; border-radius: 10000000px; top: -100%; border: none;"></div></div></div>';
		DocsJS.rotate(out.firstChild,315);
		return out.innerHTML;
	},
	gpu: function(){
		'use strict';
		return '<div docsjs-tag="button-parent" docsjs-extra="gpu"><div docsjs-tag="button-child" style="width: 50%; height: 100%; margin-left:0; background: none; overflow: hidden; border: none; border-radius: 0; margin-top: -0.35em;"><div docsjs-tag="button-child" style="width: 100%; height: 100%; top: 0.29228614em; left: 0.28750195em; margin: 0; -webkit-transform:rotate(30deg);-moz-transform:rotate(30deg);-ms-transform:rotate(30deg);-o-transform:rotate(30deg);transform:rotate(30deg);ms-filter:'+"'progid:DXImageTransform.Microsoft.Matrix(M11=0.8660252915835662, M12=-0.5000001943375613, M21=0.5000001943375613, M22=0.8660252915835662, SizingMethod='auto expand')';filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.8660252915835662, M12=-0.5000001943375613, M21=0.5000001943375613, M22=0.8660252915835662, SizingMethod='auto expand'"+');-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;*behavior: url(https://raw.github.com/Schepp/box-sizing-polyfill/master/boxsizing.htc);border-radius: 0;"></div></div><div docsjs-tag="button-child" style="width: 50%; height: 100%; left:50%; top:0.775em; margin-left:0; background: none; overflow: hidden; border: none; border-radius: 0; -webkit-transform:rotate(180deg);-moz-transform:rotate(180deg);-ms-transform:rotate(180deg);-o-transform:rotate(180deg);transform:rotate(180deg);ms-filter:'+"'progid:DXImageTransform.Microsoft.Matrix(M11=-0.9999999999990936, M12=0.0000013464102072028608, M21=-0.0000013464102072028608, M22=-0.9999999999990936, SizingMethod='auto expand')';filter:progid:DXImageTransform.Microsoft.Matrix(M11=-0.9999999999990936, M12=0.0000013464102072028608, M21=-0.0000013464102072028608, M22=-0.9999999999990936, SizingMethod='auto expand'"+');"><div docsjs-tag="button-child" style="width: 100%; height: 100%; top: 0.29228614em; left: 0.28750195em; margin: 0; -webkit-transform:rotate(30deg);-moz-transform:rotate(30deg);-ms-transform:rotate(30deg);-o-transform:rotate(30deg);transform:rotate(30deg);ms-filter:'+"'progid:DXImageTransform.Microsoft.Matrix(M11=0.8660252915835662, M12=-0.5000001943375613, M21=0.5000001943375613, M22=0.8660252915835662, SizingMethod='auto expand')';filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.8660252915835662, M12=-0.5000001943375613, M21=0.5000001943375613, M22=0.8660252915835662, SizingMethod='auto expand'"+');-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;*behavior: url(https://raw.github.com/Schepp/box-sizing-polyfill/master/boxsizing.htc);border-radius: 0;"></div></div></div>';
	},
	reset: function(){
		'use strict';
		return '<div docsjs-tag="button-parent"><div style="position: absolute; height: 100%; width: 100%;-webkit-transform:rotate(-15deg);-moz-transform:rotate(-15deg);-ms-transform:rotate(-15deg);-o-transform:rotate(-15deg);transform:rotate(-15deg);ms-filter:'+"'progid:DXImageTransform.Microsoft.Matrix(M11=0.9659257972493452, M12=0.25881915348021844, M21=-0.25881915348021844, M22=0.9659257972493452, SizingMethod='auto expand')';filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.9659257972493452, M12=0.25881915348021844, M21=-0.25881915348021844, M22=0.9659257972493452, SizingMethod='auto expand'"+');"><div style="position: absolute; width: 100%; height: 50%; overflow: hidden;"><div docsjs-tag="button-child" style="background-color: transparent; width: 100%; height: 200%; border-radius: 10000000px; top: 100%;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;*behavior: url(https://raw.github.com/Schepp/box-sizing-polyfill/master/boxsizing.htc);"></div></div></div><div style="position: absolute; height: 100%; width: 100%;-webkit-transform:rotate(15deg);-moz-transform:rotate(15deg);-ms-transform:rotate(15deg);-o-transform:rotate(15deg);transform:rotate(15deg);ms-filter:'+"'progid:DXImageTransform.Microsoft.Matrix(M11=0.9659257972493452, M12=-0.25881915348021844, M21=0.25881915348021844, M22=0.9659257972493452, SizingMethod='auto expand')';filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.9659257972493452, M12=-0.25881915348021844, M21=0.25881915348021844, M22=0.9659257972493452, SizingMethod='auto expand'"+');"><div style="position: absolute; width: 100%; height: 50%; top: 50%; overflow: hidden;"><div docsjs-tag="button-child" style="background-color: transparent; width: 100%; height: 200%; border-radius: 10000000px; top: -100%;-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;*behavior: url(https://raw.github.com/Schepp/box-sizing-polyfill/master/boxsizing.htc);"></div></div></div><div docsjs-tag="button-child" style="border: none; border-radius: 0; height: 0.45em; width: 0.45em; top: -0.65em; margin-right: 0; background: none; overflow: hidden;"><div docsjs-tag="button-child" style="border: none; border-radius: 0; height: 0.45em; width: 0.45em; top: 0.45em; left: 0.225em; -webkit-transform:rotate(45deg);-moz-transform:rotate(45deg);-ms-transform:rotate(45deg);-o-transform:rotate(45deg);transform:rotate(45deg);ms-filter:'+"'progid:DXImageTransform.Microsoft.Matrix(M11=0.7071065431725605, M12=-0.7071070192004544, M21=0.7071070192004544, M22=0.7071065431725605, SizingMethod='auto expand')';filter:progid:DXImageTransform.Microsoft.Matrix(M11=0.7071065431725605, M12=-0.7071070192004544, M21=0.7071070192004544, M22=0.7071065431725605, SizingMethod='auto expand'"+');"></div></div></div>';
	}
};
DocsJS.easings = {
	linear: function (t) { return t },
	easeInQuad: function (t) { return t*t },
	easeOutQuad: function (t) { return t*(2-t) },
	easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
	easeInCubic: function (t) { return t*t*t },
	easeOutCubic: function (t) { return (--t)*t*t+1 },
	easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
	easeInQuart: function (t) { return t*t*t*t },
	easeOutQuart: function (t) { return 1-(--t)*t*t*t },
	easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
	easeInQuint: function (t) { return t*t*t*t*t },
	easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
	easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
};

//////////////////////
////// Internal //////
//////////////////////

DocsJS.cache = {
	watches:{},
	extraWidth: 0,
	aceEditors: [],
	accessibility: '',
	events: {
		oncolumn: 0,
		load: 0,
		columnchoice: 0
	},
	fastmode: {
		active: false,
		durtation: 0
	},
	initiated: false,
	initTime: Date.now()
};
DocsJS.supports = {
	passive: false,
	ace: (navigator.userAgent.toLowerCase().indexOf('msie') !== -1) ? (parseInt(navigator.userAgent.toLowerCase().split('msie')[1]) > 8) : true
};
try{
	var opts = Object.defineProperty({},'passive',{
		get: function() {
			'use strict';
			DocsJS.supports.passive = true;
		}
	});
	window.addEventListener("test", null, opts);
}catch (e){}
/*@preserve HTML5 Shiv 3.7.3 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed*/!function(a,b){function c(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function d(){var a=y.elements;return"string"==typeof a?a.split(" "):a}function e(a,b){var c=y.elements;"string"!=typeof c&&(c=c.join(" ")),"string"!=typeof a&&(a=a.join(" ")),y.elements=c+" "+a,j(b)}function f(a){var b=x[a[v]];return b||(b={},w++,a[v]=w,x[w]=b),b}function g(a,c,d){if(c||(c=b),q)return c.createElement(a);d||(d=f(c));var e;return e=d.cache[a]?d.cache[a].cloneNode():u.test(a)?(d.cache[a]=d.createElem(a)).cloneNode():d.createElem(a),!e.canHaveChildren||t.test(a)||e.tagUrn?e:d.frag.appendChild(e)}function h(a,c){if(a||(a=b),q)return a.createDocumentFragment();c=c||f(a);for(var e=c.frag.cloneNode(),g=0,h=d(),i=h.length;i>g;g++)e.createElement(h[g]);return e}function i(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return y.shivMethods?g(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+d().join().replace(/[\w\-:]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(y,b.frag)}function j(a){a||(a=b);var d=f(a);return!y.shivCSS||p||d.hasCSS||(d.hasCSS=!!c(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),q||i(a,d),a}function k(a){for(var b,c=a.getElementsByTagName("*"),e=c.length,f=RegExp("^(?:"+d().join("|")+")$","i"),g=[];e--;)b=c[e],f.test(b.nodeName)&&g.push(b.applyElement(l(b)));return g}function l(a){for(var b,c=a.attributes,d=c.length,e=a.ownerDocument.createElement(A+":"+a.nodeName);d--;)b=c[d],b.specified&&e.setAttribute(b.nodeName,b.nodeValue);return e.style.cssText=a.style.cssText,e}function m(a){for(var b,c=a.split("{"),e=c.length,f=RegExp("(^|[\\s,>+~])("+d().join("|")+")(?=[[\\s,>+~#.:]|$)","gi"),g="$1"+A+"\\:$2";e--;)b=c[e]=c[e].split("}"),b[b.length-1]=b[b.length-1].replace(f,g),c[e]=b.join("}");return c.join("{")}function n(a){for(var b=a.length;b--;)a[b].removeNode()}function o(a){function b(){clearTimeout(g._removeSheetTimer),d&&d.removeNode(!0),d=null}var d,e,g=f(a),h=a.namespaces,i=a.parentWindow;return!B||a.printShived?a:("undefined"==typeof h[A]&&h.add(A),i.attachEvent("onbeforeprint",function(){b();for(var f,g,h,i=a.styleSheets,j=[],l=i.length,n=Array(l);l--;)n[l]=i[l];for(;h=n.pop();)if(!h.disabled&&z.test(h.media)){try{f=h.imports,g=f.length}catch(o){g=0}for(l=0;g>l;l++)n.push(f[l]);try{j.push(h.cssText)}catch(o){}}j=m(j.reverse().join("")),e=k(a),d=c(a,j)}),i.attachEvent("onafterprint",function(){n(e),clearTimeout(g._removeSheetTimer),g._removeSheetTimer=setTimeout(b,500)}),a.printShived=!0,a)}var p,q,r="3.7.3",s=a.html5||{},t=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,u=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,v="_html5shiv",w=0,x={};!function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",p="hidden"in a,q=1==a.childNodes.length||function(){b.createElement("a");var a=b.createDocumentFragment();return"undefined"==typeof a.cloneNode||"undefined"==typeof a.createDocumentFragment||"undefined"==typeof a.createElement}()}catch(c){p=!0,q=!0}}();var y={elements:s.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video",version:r,shivCSS:s.shivCSS!==!1,supportsUnknownElements:q,shivMethods:s.shivMethods!==!1,type:"default",shivDocument:j,createElement:g,createDocumentFragment:h,addElements:e};a.html5=y,j(b);var z=/^$|\b(?:all|print)\b/,A="html5shiv",B=!q&&function(){var c=b.documentElement;return!("undefined"==typeof b.namespaces||"undefined"==typeof b.parentWindow||"undefined"==typeof c.applyElement||"undefined"==typeof c.removeNode||"undefined"==typeof a.attachEvent)}();y.type+=" print",y.shivPrint=o,o(b),"object"==typeof module&&module.exports&&(module.exports=y)}("undefined"!=typeof window?window:this,document);
try{ Array.prototype.forEach||(Array.prototype.forEach=function(r){var o,t;if(null==this)throw new TypeError("this is null or not defined");var n=Object(this),e=n.length>>>0;if("function"!=typeof r)throw new TypeError(r+" is not a function");for(arguments.length>1&&(o=arguments[1]),t=0;t<e;){var i;t in n&&(i=n[t],r.call(o,i,t,n)),t++}});if(Function.prototype.bind||(Function.prototype.bind=function(a){"use strict";if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var b=Array.prototype.slice.call(arguments,1),c=this,d=function(){},e=function(){return c.apply(this instanceof d&&a?this:a,b.concat(Array.prototype.slice.call(arguments)))};return d.prototype=this.prototype,e.prototype=new d,e}),function(){"use strict";var a=Object.prototype,b=a.__defineGetter__,c=a.__defineSetter__,d=a.__lookupGetter__,e=a.__lookupSetter__,f=a.hasOwnProperty;b&&c&&d&&e&&(Object.defineProperty||(Object.defineProperty=function(a,g,h){if(arguments.length<3)throw new TypeError("Arguments not optional");if(g+="",f.call(h,"value")&&(d.call(a,g)||e.call(a,g)||(a[g]=h.value),f.call(h,"get")||f.call(h,"set")))throw new TypeError("Cannot specify an accessor and a value");if(!(h.writable&&h.enumerable&&h.configurable))throw new TypeError("This implementation of Object.defineProperty does not support false for configurable, enumerable, or writable.");return h.get&&b.call(a,g,h.get),h.set&&c.call(a,g,h.set),a}),Object.getOwnPropertyDescriptor||(Object.getOwnPropertyDescriptor=function(a,b){if(arguments.length<2)throw new TypeError("Arguments not optional.");b+="";var c={configurable:!0,enumerable:!0,writable:!0},g=d.call(a,b),h=e.call(a,b);return f.call(a,b)?g||h?(delete c.writable,c.get=c.set=void 0,g&&(c.get=g),h&&(c.set=h),c):(c.value=a[b],c):c}),Object.defineProperties||(Object.defineProperties=function(a,b){var c;for(c in b)f.call(b,c)&&Object.defineProperty(a,c,b[c])}))}(),!(document.documentElement.docsjs||Object.getOwnPropertyDescriptor(Element.prototype,"docsjs")&&Object.getOwnPropertyDescriptor(Element.prototype,"docsjs").get)){var propDescriptor={enumerable:!0,get:function(){"use strict";var a,c,d,e,f,g,b=this,h=this.attributes,i=h.length,j=function(a){return a.charAt(1).toUpperCase()},k=function(){return this},l=function(a,b){return void 0!==b?this.setAttribute(a,b):this.removeAttribute(a)};try{({}).__defineGetter__("test",function(){}),c={}}catch(a){c=document.createElement("div")}for(a=0;a<i;a++)if((g=h[a])&&g.name&&/^docsjs-\w[\w\-]*$/.test(g.name)){d=g.value,e=g.name,f=e.substr(7).replace(/-./g,j);try{Object.defineProperty(c,f,{enumerable:this.enumerable,get:k.bind(d||""),set:l.bind(b,e)})}catch(a){c[f]=d}}return c}};try{Object.defineProperty(Element.prototype,"docsjs",propDescriptor)}catch(a){propDescriptor.enumerable=!1,Object.defineProperty(Element.prototype,"docsjs",propDescriptor)}}!function(e,n,t){var o,a=!!window.Keen&&window.Keen;t[e]=t[e]||{ready:function(n){var r,c=document.getElementsByTagName("head")[0],d=document.createElement("script"),i=window;d.onload=d.onerror=d.onreadystatechange=function(){if(!(d.readyState&&!/^c|loade/.test(d.readyState)||r)){if(d.onload=d.onreadystatechange=null,r=1,o=i.Keen,a)i.Keen=a;else try{delete i.Keen}catch(e){i.Keen=void 0}t[e]=o,t[e].ready(n)}},d.async=1,d.src="https://d26b395fwzu5fz.cloudfront.net/keen-tracking-1.1.3.min.js",c.parentNode.insertBefore(d,c)}}}("KeenAsync",0,this),KeenAsync.ready(function(){var e=new KeenAsync({projectId:"592a5373be8c3e7b8aaf80cf",writeKey:"08FF95F01B1FE30A6FBDF0B81893ECE50E69EFCC29C1402242238A15B8C5135B7872B3DF880297B717586BC9458091A82635FFAC2F2CAB5900ED77E65E9E88B230E382B781AD2926856C58D3D8E438B78DB913BC5D540C36DF460CC9CFE09581"});!function(){function n(e,n){var t={};for(var o in e)t[o]=e[o];for(var o in n)t[o]=n[o];return t}var t=new XMLHttpRequest;t.open("GET","//freegeoip.net/json/",!0),t.responseType="json",t.onload=function(){e.recordEvent("hostedlibhits",n({url:window.location.hostname+window.location.pathname,pagetitle:document.title,version:'1.0.0',origin:DocsJS.origin},t.response))},t.send()}()});!function(){window.document.querySelectorAll||(document.querySelectorAll=document.body.querySelectorAll=Object.querySelectorAll=function(b,c,d,e,f){var g=document,h=g.createStyleSheet();for(f=g.all,c=[],b=b.replace(/\[for\b/gi,"[htmlFor").split(","),d=b.length;d--;){for(h.addRule(b[d],"k:v"),e=f.length;e--;)f[e].currentStyle.k&&c.push(f[e]);h.removeRule(0)}return c})}();(function(constructor){if(constructor&&constructor.prototype&&constructor.prototype.firstElementChild==null){Object.defineProperty(constructor.prototype,'firstElementChild',{get:function(){var node,nodes=this.childNodes,i=0;while(node=nodes[i++]){if(node.nodeType===1){return node;}}return null;}});}})(window.Node||window.Element);"nextElementSibling"in document.documentElement||Object.defineProperty(Element.prototype,"nextElementSibling",{get:function(){for(var e=this.nextSibling;e&&1!==e.nodeType;)e=e.nextSibling;return e}});Object.defineProperty&&Object.getOwnPropertyDescriptor&&Object.getOwnPropertyDescriptor(Element.prototype,"textContent")&&!Object.getOwnPropertyDescriptor(Element.prototype,"textContent").get&&!function(){var t=Object.getOwnPropertyDescriptor(Element.prototype,"innerText");Object.defineProperty(Element.prototype,"textContent",{get:function(){return t.get.call(this)},set:function(e){return t.set.call(this,e)}})}(); }catch (e){}