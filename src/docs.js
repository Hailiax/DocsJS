// JavaScript Document
// Planned for future releases: allow topics and sections to be embedded in e-g/e-x, documentation search, menu as a popup on mobile (make other things popup on mobile), Jump to minimized topic will maximize

/*
MIT License

Copyright (c) 2017 Hailiax

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//////////////////////
/////// Basics ///////
//////////////////////

var DocsJS = {};
DocsJS.aceTheme = {
	Hailaxian: 'chrome',
	Minimal: 'clouds'
};
DocsJS.apply = function (func){
	'use strict';
	var docs = document.getElementsByTagName('docs-js');
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
	// *** console.log('DocsJS: init started @',performance.now());
	
	// Convert markdown
	showdown.setOption('omitExtraWLInCodeBlocks', true);
	showdown.setOption('noHeaderId', true);
	showdown.setOption('parseImgDimensions', true);
	showdown.setOption('strikethrough', true);
	showdown.setOption('tables', true);
	showdown.setOption('tasklists', true);
	showdown.setOption('openLinksInNewWindow', true);
	showdown.setOption('backslashEscapesHTMLTags', true);
	DocsJS.apply(function(doc){
		if (doc.getAttribute('mode') === 'markdown'){
			var converter = new showdown.Converter(),
				text = doc.innerHTML.replace(/<!--/g,'').replace(/-->/g,''),
				html = converter.makeHtml(text);
			doc.innerHTML = html;
			var nodes = doc.querySelectorAll('*');
			var open = [];
			for (var index = 0; index < nodes.length; index++){
				var node = nodes[index];
				
				switch (node.tagName.toUpperCase()){
					case 'H1':
						node.outerHTML = '<!--</t-x></s-c><s-c>\r\n<h-d>\r\n<t-l>-->'+node.innerHTML+'<!--</t-l>\r\n<t-x>-->';
						open.push(['s-c',1]);
						open.push(['h-d',1]);
						open.push(['t-x',1]);
						break;
					case 'H2':
						node.outerHTML = '<!--</'+open[open.length-1][0]+'>\r\n</'+open[open.length-2][0]+'>\r\n<t-p>\r\n<t-l>-->'+node.innerHTML+'<!--</t-l>\r\n<t-x>-->';
						open.pop();
						open.pop();
						open.push(['t-p',2]);
						open.push(['t-x',2]);
						break;
					case 'PRE':
						var mode = node.querySelector('code').className.split(' ')[0] || 'plain_text';
						mode = mode.toLowerCase();
						switch (mode){
							case 'js':
								mode = 'javascript';
								break;
							case 'bash':
								mode = 'sh';
								break;
							case 'cpp':
								mode = 'c_cpp';
								break;
						}
						node.outerHTML = '<!--</t-x>\r\n<e-g>\r\n--><c-d docsjs-lang="'+mode+'">'+node.querySelector('code').innerHTML+'</c-d><!--\r\n</e-g>\r\n<t-x>-->';
						break;
				}
			}
			for (var unclosed = open.length; unclosed > 0; unclosed--){
				doc.innerHTML += '<!--\r\n</'+open[unclosed-1][0]+'>-->';
			}
			doc.innerHTML = doc.innerHTML.replace(/<!--/g,'').replace(/-->/g,'');
			
			var selector = 'docs-js>*';
			nodes = document.querySelectorAll(selector);
			var depth = 0;
			while (nodes.length > 0){
				for (var n = 0; n < nodes.length; n++){
					nodes = document.querySelectorAll(selector);
					var tabs = '';
					for (var d = 0; d < depth; d++){
						tabs += '<!--\t-->';
					}
					var split = nodes[n].outerHTML.split('\n');
					if (split[split.length-1].charAt(0) === '<' && split[split.length-1].charAt(1) === '/'){
						split[split.length-1] = tabs + split[split.length-1];
					}
					nodes[n].outerHTML = tabs+split.join('\n');
				}
				depth++;
				selector += '>*';
				nodes = document.querySelectorAll(selector);
			}
			doc.innerHTML = doc.innerHTML.replace(/<!--/g,'').replace(/-->/g,'');
			if (!DocsJS.doNotLogConvertedMarkdown){
				console.log(doc.innerHTML);
				console.log('See your converted Markdown above.\n\nIf you switch to regular DocsJS syntax, make sure to remove mode="markdown" on your <docs-js> tag.\n\nTo disable this message, set DocsJS.doNotLogConvertedMarkdown = true;');
			}
			DocsJS.eg.name = 'Code';
		}
	});
	
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
		doc.innerHTML = '<main role="main"><s-c><button role="button" docsjs-tag="accessibility-button" tabindex="0" onclick="DocsJS.toggleRecommendedAccessibility(this)" onkeydown="DocsJS.accessButtonSpaceClick(this,event)">Accessibility Mode</button><div docsjs-tag="header"></div></s-c><s-c style="display:none;"><button role="button" docsjs-tag="accessibility-button" tabindex="0" onclick="DocsJS.toggleExtendedAccessibility()" onkeydown="DocsJS.accessButtonSpaceClick(this,event)">Extended Accessibility Mode</button></s-c>'+doc.innerHTML+'</main>';
	});
	DocsJS.apply(function(doc){
		doc.style.fontSize = DocsJS.fontsize._value + 'px';
		doc.innerHTML += '<div></div>'+
			'<div docsjs-tag="menu" style="display: none;"></div>' +
			'<div docsjs-tag="column-left" docsjs-state="none" style="position:fixed;">'+DocsJS.column.choice(-1)+'</div>' +
			'<div docsjs-tag="column-right" docsjs-state="none" style="left:100%;position:fixed;">'+DocsJS.column.choice(1)+'</div>' +
			'<div docsjs-extras="learnmore" style="position: relative; width: 100%; height: 1.25em; line-height:1.25em; text-align: center; font-size: 0.75em; opacity: 0.5; text-shadow: -0.04em -0.04em 0.12em #fff,0.04em 0.04em 0.12em #fff,-0.04em 0.04em 0.12em #fff,0.04em -0.04em 0.12em #fff;"><a href="https://hailiax.io/docsjs/" target="_blank" style="text-decoration: none; color: #000; line-height: 1.25em;">– Powered by Docs.JS –</a></div><div docsjs-tag="bg" docsjs-extra="invert"></div>';
	});
	DocsJS.fontsize._init = DocsJS.fontsize._value;

	// Finish initiation
	var finish = function(){
		// *** console.log('DocsJS: DocsJS.refresh() done @',performance.now());
		window.setTimeout(function(){
			// Watch events
			DocsJS.addEvent(window,'scroll',DocsJS.scrolled);
			DocsJS.addEvent(window,'resize',DocsJS.resized);
			DocsJS.addEvent(window,'hashchange',DocsJS.hashchanged);
			DocsJS.resized();

			// Check for min and max
			var duration = DocsJS.animation.duration;
			DocsJS.animation.duration = 0;
			DocsJS.apply(function(doc){
				DocsJS.forEach(doc.querySelectorAll('[docsjs-state="max"]'),function(el){
					if (el.tagName.toUpperCase() === 'E-X' || el.tagName.toUpperCase() === 'E-G'){
						el.setAttribute('docsjs-internal-default','max');
						DocsJS.rotate(el.previousSibling.querySelector('[docsjs-tag="button-ebefore"]'),90);
					} else if (el.tagName.toUpperCase() === 'T-P' || el.tagName.toUpperCase() === 'H-D'){
						el.setAttribute('docsjs-internal-default','max');
					} else if (el.tagName.toUpperCase() === 'S-C'){
						el.setAttribute('docsjs-internal-default','max');
					}
				});
				DocsJS.forEach(doc.querySelectorAll('[docsjs-state="min"]'),function(el){
					if (el.tagName.toUpperCase() === 'E-X' || el.tagName.toUpperCase() === 'E-G'){
						el.setAttribute('docsjs-internal-default','min');
						el.docsjs.state = 'max';
						el.previousSibling.onclick();
					} else if (el.tagName.toUpperCase() === 'T-P' || el.tagName.toUpperCase() === 'H-D'){
						el.setAttribute('docsjs-internal-default','min');
						el.docsjs.state = 'max';
						el.querySelector('t-l').onclick({target:{docsjs:{tag:'T-L'}}});
					} else if (el.tagName.toUpperCase() === 'S-C'){
						el.setAttribute('docsjs-internal-default','min');
						el.docsjs.state = 'max';
						el.querySelector('[docsjs-tag="button-minimize"]').onclick();
					}
				});
			});

			// Accessibility styles
			var accessStyle = document.createElement('style');
			(document.head || document.getElementsByTagName("head")[0]).appendChild(accessStyle);
			var accessStyleText = '[docsjs-tag=accessibility-mode-content] h1,[docsjs-tag=accessibility-mode-content] h2,[docsjs-tag=accessibility-mode-content] h3,[docsjs-tag=accessibility-mode-content] h4,[docsjs-tag=accessibility-mode-content] h5,[docsjs-tag=accessibility-mode-content] h6{line-height:2em;font-weight:bold;text-decoration:underline;margin:0}[docsjs-tag=accessibility-mode-wrapper]{position:fixed;width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch;z-index:999999999999;padding:1em;box-sizing:border-box;background:#eaeaea}[docsjs-tag=accessibility-mode-content]{position:relative;width:100%;left:0;right:0;margin-left:auto;margin-right:auto;padding:1em;background-color:'+DocsJS.getStyle(document.querySelector('t-x'),'background-color')+';color:'+DocsJS.getStyle(document.querySelector('t-x'),'color')+';box-shadow:0 5px 20px 3px rgba(0,0,0,.3);box-sizing:border-box;overflow:hidden;font-size:1.2em}[docsjs-tag=accessibility-mode-content] p[docsjs-tag=textNode]{display:inline;margin-top:0;margin-bottom:0}[docsjs-tag=accessibility-mode-content] h1{font-size:2.5em}[docsjs-tag=accessibility-mode-content] h2{font-size:2em}[docsjs-tag=accessibility-mode-content] h3{font-size:1.6em}[docsjs-tag=accessibility-mode-content] h4{font-size:1.4em}[docsjs-tag=accessibility-mode-content] h5{font-size:1.2em}[docsjs-tag=accessibility-mode-content] h6{font-size:1.2em; font-weight: regular;}';
			if (typeof accessStyle.styleSheet === 'undefined'){
				accessStyle.innerHTML = accessStyleText;
			} else{
				accessStyle.styleSheet.cssText = accessStyleText;
			}
			
			// *** console.log('DocsJS: layout done @',performance.now());
			window.setTimeout(function(){
				// Init cd
				DocsJS.cd.refresh();
				// *** console.log('DocsJS: Ace done @',performance.now());
				
				if (callback === undefined){callback = function(){};}
				DocsJS.cache.initiated = true;
				DocsJS.scrolled();
				
				// Apply sidebars option
				var sidebars = document.querySelector('docs-js').getAttribute('sidebars');
				var menuCompensation = 200;
				if (sidebars !== null){
					sidebars = sidebars.split(' ');
					switch (sidebars[0]){
						case 'choice':
							break;
						case 'none':
							document.querySelector('[docsjs-tag="column-left"]').style.display = 'none';
							break;
						case 'menu':
							if (DocsJS.window.width() > DocsJS.width.min + 500){
								DocsJS.cache.events.columnchoice = 'menu';
								DocsJS.cache.events.oncolumn = -1;
								DocsJS.column.start(-1);
								menuCompensation = 0;
							}
							break;
						case 'e-g':
							if (DocsJS.window.width() > DocsJS.width.max - menuCompensation){
								DocsJS.cache.events.columnchoice = 'e-g';
								DocsJS.cache.events.oncolumn = -1;
								DocsJS.column.start(-1);
							}
							break;
						case 'e-x':
							if (DocsJS.window.width() > DocsJS.width.max - menuCompensation){
								DocsJS.cache.events.columnchoice = 'e-x';
								DocsJS.cache.events.oncolumn = -1;
								DocsJS.column.start(-1);
							}
							break;
					}
					switch (sidebars[1]){
						case 'choice':
							break;
						case 'none':
							document.querySelector('[docsjs-tag="column-right"]').style.display = 'none';
							break;
						case 'menu':
							if (menuCompensation > 0){
								if (DocsJS.window.width() > DocsJS.width.min + 500){
									DocsJS.cache.events.columnchoice = 'menu';
									DocsJS.cache.events.oncolumn = 1;
									DocsJS.column.start(1);
									menuCompensation = 0;
								}
							}
							break;
						case 'e-g':
							if (DocsJS.window.width() > DocsJS.width.max - menuCompensation){
								DocsJS.cache.events.columnchoice = 'e-g';
								DocsJS.cache.events.oncolumn = 1;
								DocsJS.column.start(1);
							} else{
								menuCompensation = 400;
								if (DocsJS.window.width() > DocsJS.width.max - menuCompensation){
									DocsJS.column.stop(-1);
									DocsJS.cache.events.columnchoice = 'e-g';
									DocsJS.cache.events.oncolumn = 1;
									DocsJS.column.start(1);
								}
							}
							break;
						case 'e-x':
							if (DocsJS.window.width() > DocsJS.width.max - menuCompensation){
								DocsJS.cache.events.columnchoice = 'e-x';
								DocsJS.cache.events.oncolumn = 1;
								DocsJS.column.start(1);
							} else{
								menuCompensation = 400;
								if (DocsJS.window.width() > DocsJS.width.max - menuCompensation){
									DocsJS.column.stop(-1);
									DocsJS.cache.events.columnchoice = 'e-x';
									DocsJS.cache.events.oncolumn = 1;
									DocsJS.column.start(1);
								}
							}
							break;
					}
				}
				
				// Done
				DocsJS.hashchanged();
				DocsJS.cd.refresh();
				DocsJS.animation.duration = duration;
				callback();
				DocsJS.events.ready();
				// *** console.log('DocsJS: ready @',performance.now());
			},0);
		},0);
	};
	// *** console.log('DocsJS: Essentials rendered @',performance.now());
	window.setTimeout(function(){
		DocsJS.refresh(finish);
	},0);
};
window.html5 = {
  'elements': 's-c h-d t-p t-l t-x e-g e-x c-d docs-js main nav code button'
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
			.replace(/<v-r (.*?)\W/g,'<v-r docsjs-tag="v-r" aria-hidden="true" docsjs-name="$1"');
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
		var state = 'active';
		recurse = function(s){
			tpCounter++;
			DocsJS.forEach(s.querySelectorAll('t-p > t-l'),function(el){
				el.parentElement.setAttribute('aria-labelledby','docsjs-aria-topic-'+el.textContent.replace(/\W+/g,'_')+tpCounter);
				el.setAttribute('docsjs-arialabel','docsjs-aria-topic-'+el.textContent.replace(/\W+/g,'_')+tpCounter);
				var minimizeButton = document.createElement('div');
				minimizeButton.setAttribute('docsjs-tag','button-menu');
				minimizeButton.setAttribute('docsjs-state',state);
				minimizeButton.setAttribute('docsjs-internal','menuHidden');
				minimizeButton.innerHTML = DocsJS.buttons.menu.html();
				el.appendChild(minimizeButton);
				state = 'inactive';
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
				if (el.previousSibling === null || el.previousSibling.docsjs === undefined || (el.previousSibling.tagName.toUpperCase() !== 'ebefore' && el.parentElement.tagName.toUpperCase() !== 'column-content')){
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
				if (el.previousSibling === null || el.previousSibling.docsjs === undefined || el.previousSibling.tagName.toUpperCase() !== 'ebefore'){
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

	// Generate accessiblity
	DocsJS.apply(function(doc){
		var access = '';
		DocsJS.forEach(doc.querySelectorAll('docs-js>main>s-c'),function(el){
			var read = function(el, level){
				if (level > 6){level = 6;}
				DocsJS.forEach(el.childNodes,function(el){
					if (el.nodeType === 1){
						switch (el.hasAttribute('docsjs-tag')? el.tagName.toUpperCase(): el.tagName.toUpperCase()){
							case 'H-D':
								read(el,(level+1));
								level++;
								break;
							case 'T-P':
								read(el,(level+1));
								break;
							case 'S-C':
								read(el,level);
								break;
							case 'T-L':
								el.innerHTML = '<h'+(level+1)+' id="'+el.docsjs.arialabel+'">'+el.innerHTML+'</h'+(level+1)+'>';
								access += '<h'+level+'>'+el.textContent+'</h'+level+'>';
								break;
							case 'T-X':
								read(el,level);break;
							case 'E-G':
								access += '<h'+(level+1)+'>'+(el.hasAttribute('docsjs-name')? el.docsjs.name: DocsJS.eg.name)+'</h'+(level+1)+'>';
								read(el,level);break;
							case 'E-X':
								access += '<h'+(level+1)+'>'+(el.hasAttribute('docsjs-name')? el.docsjs.name: DocsJS.ex.name)+'</h'+(level+1)+'>';
								read(el,level);break;
							case 'C-D':
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
			read(el, -1);
		});
		DocsJS.cache.accessibility = '<main role="main" docsjs-tag="accessibility"><div docsjs-tag="accessibility-mode-wrapper"><div docsjs-tag="accessibility-mode-background"></div><div docsjs-tag="accessibility-mode-content" style="max-width:'+DocsJS.width.max+'px;">'+access+'</div></div></main>';
	});

	// Generate menu
	DocsJS.apply(function(doc,index){
		var menu = doc.querySelector('[docsjs-tag="menu"]');
		var readStructure = function(parent, location){
			var structure = '';
			var contents = parent.querySelectorAll('s-c,t-p');
			if (contents.length !== 0){
				var sub = 0;
				for (var i = 0; i < contents.length; i++){
					if (contents[i].nodeType === 1 && contents[i].parentElement === parent){
						var newLocation = location + ',' + (i-sub);
						contents[i].setAttribute('docsjs-location','['+newLocation+']');
						var title = (contents[i].querySelector('t-l') || contents[i].querySelector('h-d > t-l') || undefined);
						if (title !== undefined){
							structure += '<div docsjs-tag="menu-item" docsjs-state="max" onclick="'+"if ((event.target || (event.srcElement || event.originalTarget)) === this){if (this.docsjs.state === 'min'){this.docsjs.state = 'max';} else{this.docsjs.state = 'min';}}"+'"><div docsjs-tag="menu-title" role="button" tabindex="0" aria-labelledby="Navigate to '+title.innerText+'" docsjs-state="" docsjs-menu-location="['+newLocation+']" onkeyup="DocsJS.spaceClick(this,event)" onclick="DocsJS._menuClicked(this,['+newLocation+']);" docsjs-menu-destination="'+contents[i].tagName.toUpperCase()+'">'+title.innerText+'</div>'+readStructure(contents[i],newLocation)+'</div>';
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
			'<div docsjs-tag="menu-item"><div docsjs-tag="menu-title" docsjs-state="youarehere" docsjs-menu-internal="top" onclick="DocsJS._menuClicked(this,true);">'+DocsJS.menu.top+'</div></div>'+
			readStructure(doc.querySelector('main') || doc, index)+
			'<div docsjs-tag="menu-item"><div docsjs-tag="menu-title" docsjs-state="" docsjs-menu-internal="btm" onclick="DocsJS._menuClicked(this,false);">'+DocsJS.menu.bottom+'</div></div>';
		
		doc.querySelector('[docsjs-tag="header"]').innerHTML = '';
		DocsJS.forEach(doc.querySelectorAll('main>s-c'),function(el){
			try{doc.querySelector('[docsjs-tag="header"]').innerHTML += '<span onclick="DocsJS.scroll('+el.docsjs.location+')">' + el.querySelector('t-l').textContent + '</span> ';}catch(e){}
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
				var tlHeight = parseInt(DocsJS.getStyle(tl,'height')) + parseInt(DocsJS.getStyle(tl,'padding-top')) + parseInt(DocsJS.getStyle(tl,'padding-bottom')) + parseInt(DocsJS.getStyle(tl,'border-top-width')) + parseInt(DocsJS.getStyle(tl,'border-bottom-width')) + parseInt(DocsJS.getStyle(sc,'padding-top')) + parseInt(DocsJS.getStyle(sc,'padding-bottom')) + parseInt(DocsJS.getStyle(sc,'border-top-width')) + parseInt(DocsJS.getStyle(sc,'border-bottom-width'));
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
						DocsJS.column.align(doc);
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
						el.parentElement.parentElement.onclick({target:{docsjs:{tag:'T-L'}}});
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
						DocsJS.column.align(doc);
					}
				});
				DocsJS.events.menuToggle(el.parentElement.parentElement.parentElement.querySelector('[docsjs-tag="menu"]'));
			};
			el.onclick = click;
		});
		DocsJS.forEach(doc.querySelectorAll('t-l'),function(el){
			var click = function(e){
				if ((e.target || (e.srcElement || e.originalTarget)).tagName === 'T-L' || (e.target || (e.srcElement || e.originalTarget)).tagName === 't-l' || (e.target || (e.srcElement || e.originalTarget)).docsjs.tag === 'T-L' || (e.target || (e.srcElement || e.originalTarget)).docsjs.tag === '_change' || (e.target || (e.srcElement || e.originalTarget)).tagName.toUpperCase().charAt(0) === 'H'){
					if (el.parentElement.tagName.toUpperCase() === 'H-D' && el.parentElement.parentElement.docsjs.state === 'min' && el.parentElement.docsjs.state === 'min'){
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
								DocsJS.column.align(doc);
								pass[0].parentElement.docsjs.state = (pass[1] === 0)? 'max' : 'min';
								pass[0].onclick = click;
							}
						});
						if (el.parentElement.tagName.toUpperCase() === 'T-P'){
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
						if (pass[0].tagName.toUpperCase() === 'E-X'){
							DocsJS.buttons.ex.animation(pass[0].previousSibling.querySelector('[docsjs-tag="button-ebefore"]'),now);
						} else if (pass[0].tagName.toUpperCase() === 'E-G'){
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
						DocsJS.column.align(doc);
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
		var mousedown = function(e){
			if (DocsJS.cache.events.oncolumn !== 0){
				DocsJS.removeEvent(doc,'mousedown',mousedown);
				var start = e.clientX;
				var mousemove = function(e){
					var delta = DocsJS.cache.events.oncolumn*(start - e.clientX);
					start = e.clientX;
					DocsJS.columnOffsets[(DocsJS.cache.events.oncolumn < 0 ? 'left' : 'right')] += delta;
					DocsJS.resized();
				};
				DocsJS.addEvent(doc,'mousemove',mousemove);
				var mouseup = function(){
					DocsJS.column.align(doc);
					DocsJS.removeEvent(doc,'mousemove',mousemove);
					DocsJS.removeEvent(doc,'mouseup',mouseup);
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
					DocsJS.column.align(doc);
					DocsJS.removeEvent(doc,'touchmove',touchmove);
					DocsJS.removeEvent(doc,'touchend',touchend);
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

DocsJS.hashchanged = function(){
	'use strict';
	if (!DocsJS.cache.hashChanged){
		var location = decodeURIComponent(window.location.hash.substr(1));
		if (location !== ''){
			try{location = JSON.parse(location);}catch(e){}
			DocsJS.scroll(location);
		}
	} else{
		DocsJS.cache.hashChanged = false;
	}
};
DocsJS.scrolled = function(){
	'use strict';
	if (DocsJS.cache.initiated && !DocsJS.cache.scrollDebounce){
		DocsJS.cache.scrollDebounce = window.setTimeout(function(){
				var topEl = false;
				var nextTopEl = false;
				var scrollTop = DocsJS.window.scrollTop();
				var height = DocsJS.window.height();
				var scrollHeight = document.documentElement.scrollHeight;
				var vals = [];
				var tps = document.querySelectorAll('t-p,h-d');
				DocsJS.forEach(tps,function(el){
					var tlRect = el.querySelector('t-l').getBoundingClientRect();
					vals.push((tlRect.top+tlRect.bottom)/2);
				});
				DocsJS.forEach(tps,function(el,index){
					if (el.tagName.toUpperCase() === 'T-P'){
						if (nextTopEl === true){
							nextTopEl = index;
						}
					}
					var top = vals[index];
					if (top > 0 && el.parentElement.docsjs.state === 'max' && !topEl){
						topEl = index;
						nextTopEl = true;
					}
				});
				topEl = tps[topEl] || tps[0];
				nextTopEl = tps[nextTopEl] || document.querySelector('div[docsjs-tag="button-menu"]').parentElement;
				document.querySelector('div[docsjs-state="active"]').docsjs.state = 'inactive';
				if (topEl.tagName.toUpperCase() === 'T-P'){
					topEl.querySelector('div[docsjs-tag="button-menu"]').docsjs.state = 'active';
				} else{
					nextTopEl.querySelector('div[docsjs-tag="button-menu"]').docsjs.state = 'active';
				}
				topEl = topEl.docsjs.location || topEl.parentElement.docsjs.location;
				document.querySelector('div[docsjs-state="youarehere"]').docsjs.state = '';
				if (scrollTop === 0){
					document.querySelector('div[docsjs-menu-internal="top"]').docsjs.state = 'youarehere';
				} else if (scrollTop === scrollHeight - height){
					document.querySelector('div[docsjs-menu-internal="btm"]').docsjs.state = 'youarehere';
				} else{
					document.querySelector('div[docsjs-menu-location="'+topEl+'"]').docsjs.state = 'youarehere';
				}
				var hash = encodeURIComponent(document.querySelector('div[docsjs-state="youarehere"]').docsjs.menuLocation || scrollTop === 0);
				if (hash !== window.location.hash.substr(1)){
					if (!!(window.history && history.pushState)){
						history.replaceState(undefined, undefined, "#"+hash);
					}
					DocsJS.forEach(document.querySelectorAll('div[docsjs-state="youarehere"]'),function(ti){
						ti.docsjs.state = '';
					});
					if (scrollTop === 0){
						DocsJS.forEach(document.querySelectorAll('div[docsjs-menu-internal="top"]'),function(ti){
							ti.docsjs.state = 'youarehere';
						});
					} else if (scrollTop === scrollHeight - height){
						DocsJS.forEach(document.querySelectorAll('div[docsjs-menu-internal="btm"]'),function(ti){
							ti.docsjs.state = 'youarehere';
						});
					} else{
						DocsJS.forEach(document.querySelectorAll('div[docsjs-menu-location="'+topEl+'"]'),function(ti){
							ti.docsjs.state = 'youarehere';
						});
					}
					DocsJS.forEach(document.querySelectorAll('div[docsjs-tag="column-left"] div[docsjs-state="youarehere"]'),function(yr){
						var yrRect = yr.getBoundingClientRect();
						var diffBtm = height - yrRect.bottom;
						var tp = document.querySelector('div[docsjs-tag="column-left"] div[docsjs-tag="menu"]');
						var diffTop = yrRect.top - parseInt(DocsJS.getStyle(tp,'margin-top')) - parseInt(DocsJS.getStyle(tp,'padding-top')) - parseInt(DocsJS.getStyle(tp,'border-top-width'));
						if (diffBtm < 0){
							yr.offsetParent.parentElement.scrollTop -= diffBtm;
						} else if (diffTop < 0){
							yr.offsetParent.parentElement.scrollTop += diffTop;
						}
					});
				}
			DocsJS.cache.scrollDebounce = false;
		},150);
	}
};
DocsJS.resized = function(){
	'use strict';
	var docWidth, docMargin, rc, lc;
	DocsJS.apply(function(doc){
		rc = doc.querySelector('[docsjs-tag="column-right"]');
		lc = doc.querySelector('[docsjs-tag="column-left"]');
	});
	DocsJS.cache.extraWidth = 0;
	var minWidth = 100;
	if (DocsJS.window.width() > DocsJS.width.max + 200){
		DocsJS.fontsize._scalar = 1;
		DocsJS.apply(function(doc){
			doc.style.fontSize = DocsJS.fontsize._value+'px';
			var width = (DocsJS.window.width() - DocsJS.width.max)/2;
			DocsJS.cache.extraWidth = width-100;
			minWidth = (width-200)*-1;
			lc.style.width = width+DocsJS.columnOffsets.left+'px';
			rc.style.width = width+DocsJS.columnOffsets.right+'px';
			rc.style.marginLeft = -1*width-DocsJS.columnOffsets.right+'px';
			DocsJS.forEach(doc.querySelectorAll('main > s-c'),function(el){
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
		if (DocsJS.columnOffsets.right < minWidth){
			DocsJS.columnOffsets.right = minWidth;
		}
		if (DocsJS.columnOffsets.left < minWidth){
			DocsJS.columnOffsets.left = minWidth;
		}
	} else if (DocsJS.window.width() > DocsJS.width.min + 200){
		DocsJS.fontsize._scalar = 1;
		if (DocsJS.column.state[0] === 'none' && DocsJS.window.width()-DocsJS.width.min < 400){
			DocsJS.columnOffsets.left = -25.8765;
		} else if (DocsJS.window.width()-DocsJS.width.min > 400){
			if (DocsJS.columnOffsets.left === -25.8765){
				DocsJS.columnOffsets.left = 0;
			}
		}
		if (DocsJS.column.state[1] === 'none' && DocsJS.window.width()-DocsJS.width.min < 400){
			DocsJS.columnOffsets.right = -25.8765;
		} else if (DocsJS.window.width()-DocsJS.width.min > 400){
			if (DocsJS.columnOffsets.right === -25.8765){
				DocsJS.columnOffsets.right = 0;
			} 
		}
		if (DocsJS.columnOffsets.left > 0 && DocsJS.column.state[0] === 'none'){
			DocsJS.columnOffsets.left = 0;
		}
		if (DocsJS.columnOffsets.right > 0 && DocsJS.column.state[1] === 'none'){
			DocsJS.columnOffsets.right = 0;
		}
		DocsJS.apply(function(doc){
			doc.style.fontSize = DocsJS.fontsize._value+'px';
			lc.style.width = 100+DocsJS.columnOffsets.left+'px';
			rc.style.width = 100+DocsJS.columnOffsets.right+'px';
			rc.style.marginLeft = -1*100-DocsJS.columnOffsets.right+'px';
			DocsJS.forEach(doc.querySelectorAll('main > s-c'),function(el){
				el.style.width = DocsJS.window.width()-200-DocsJS.columnOffsets.left-DocsJS.columnOffsets.right+'px';
				el.style.marginLeft = 100+DocsJS.columnOffsets.left+'px';
			});
		});
		if (DocsJS.columnOffsets.left < minWidth && DocsJS.column.state[0] !== 'none'){
			DocsJS.columnOffsets.left = minWidth;
		}
		if (DocsJS.columnOffsets.right < minWidth && DocsJS.column.state[1] !== 'none'){
			DocsJS.columnOffsets.right = minWidth;
		}
	} else{
		DocsJS.apply(function(doc){
			DocsJS.fontsize._scalar = Math.sqrt(DocsJS.window.width()/(DocsJS.width.min+200));
			doc.style.fontSize = DocsJS.fontsize._value*DocsJS.fontsize._scalar+'px';
			lc.style.width = rc.style.width = rc.style.marginLeft = '0';
			DocsJS.forEach(doc.querySelectorAll('main > s-c'),function(el){
				el.style.width = '100%';
				el.style.marginLeft = '0';
			});
		});
	}
	if (DocsJS.cache.initiated){
		DocsJS.cd.resize();
		if (DocsJS.cache.events.oncolumn === 0){
			DocsJS.scrolled();
			DocsJS.apply(function(doc){
				DocsJS.column.align(doc);
			});
		}
	}
	DocsJS.forEach(document.querySelectorAll('[docsjs-tag="column-header"]'),function(hd){
		hd.style.width = hd.parentElement.style.width;
	});
};
DocsJS._menuClicked = function(el, loc){
	'use strict';
	if (el.offsetParent.parentElement.tagName.toUpperCase() === 'T-P'){
		el.offsetParent.parentElement.querySelector('[docsjs-tag="button-menu"]').onclick();
		window.setTimeout(function(){
			DocsJS.scroll(loc);
		},DocsJS.animation.duration);
	} else{
		DocsJS.scroll(loc);
	}
};
DocsJS.bindPrefs = function(){
	'use strict';
	DocsJS.apply(function(doc){
		DocsJS.forEach(doc.querySelectorAll('[docsjs-pref="aA"]'),function(el){
			el.onclick = function(){
				DocsJS.fontsize._value++;
				DocsJS.resized();
				DocsJS.column.align(doc);
				DocsJS.scrolled();
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
				DocsJS.resized();
				DocsJS.column.align(doc);
				DocsJS.scrolled();
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
				DocsJS.forEach(doc.querySelectorAll('t-l'),function(el){
					if (el.parentElement.docsjs.state === 'max'){
						el.onclick({target:{docsjs:{tag:'T-L'}}});
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
					window.setTimeout(function(){
						DocsJS.scrolled();
						DocsJS.events.preferenceChanged('Minimize all');
					},DocsJS.animation.duration);
				},DocsJS.animation.duration);
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
					DocsJS.forEach(doc.querySelectorAll('t-l'),function(el){
						if (el.parentElement.docsjs.state === 'min'){
							el.onclick({target:{docsjs:{tag:'T-L'}}});
						}
					});
					window.setTimeout(function(){
						DocsJS.scrolled();
						DocsJS.events.preferenceChanged('Minimize half');
					},DocsJS.animation.duration);
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
					DocsJS.forEach(doc.querySelectorAll('t-l'),function(el){
						if (el.parentElement.docsjs.state === 'min'){
							el.onclick({target:{docsjs:{tag:'T-L'}}});
						}
					});
					window.setTimeout(function(){
						DocsJS.scrolled();
						DocsJS.events.preferenceChanged('Minimize none');
					},DocsJS.animation.duration);
				},DocsJS.animation.duration);
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
							DocsJS.events.preferenceChanged('Invert colors');
						}
					});
				} else{
					DocsJS.animate({
						from: 100,	to: 0,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
						step: function(now){
							doc.style.filter = 'invert('+now+'%)';
							doc.style.WebkitFilter = 'invert('+now+'%)';
						},
						callback: function(){
							doc.style.filter = '';
							doc.style.WebkitFilter = '';
							DocsJS.events.preferenceChanged('Invert colors');
						}
					});
				}
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
						DocsJS.scrolled();
						DocsJS.column.stop(-1);
						DocsJS.column.stop(1);
					}
				});
				DocsJS.animate({
					from: DocsJS.columnOffsets.right,	to: 0,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
					step: function(now){
						DocsJS.columnOffsets.right = now;
						DocsJS.resized();
					},
					callback: function(){
						DocsJS.scrolled();
						DocsJS.column.stop(-1);
						DocsJS.column.stop(1);
					}
				});
				DocsJS.fontsize._value = DocsJS.fontsize._init;
				DocsJS.resized();
				DocsJS.scrolled();
				if (doc.style.filter === 'invert(100%)'){
					DocsJS.animate({
						from: 100,	to: 0,	duration: DocsJS.animation.duration,	easing: DocsJS.easings.easeOutQuart,
						step: function(now){
							doc.style.filter = 'invert('+now+'%)';
							doc.style.WebkitFilter = 'invert('+now+'%)';
						},
						callback: function(){
							doc.style.filter = '';
							doc.style.WebkitFilter = '';
						}
					});
				}
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="button-menu"]'),function(el){
					if (el.docsjs.internal === 'menuVisible'){
						el.onclick();
					}
				});
				DocsJS.forEach(doc.querySelectorAll('[docsjs-internal-default="min"],[docsjs-internal-default="max"]'),function(el){
					if (el.docsjs.internalDefault !== el.docsjs.state){
						switch (el.tagName.toUpperCase()){
							case 'S-C':
								el.querySelector('[docsjs-tag="button-minimize"]').onclick();
								break;
							case 'T-P':
								el.querySelector('t-l').onclick({target:{docsjs:{tag:'T-L'}}});
								break;
							case 'E-X':
							case 'E-G':
								el.previousSibling.onclick();
								break;
						}
					}
				});
				window.setTimeout(function(){
					DocsJS.events.preferenceChanged('Reset');
				},DocsJS.animation.duration);
			};
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
		DocsJS.column.stop(1);
		DocsJS.column.stop(-1);
		DocsJS.cache.events.columnchoice = 'menu';
		DocsJS.columnOffsets.left = 0.1;
		DocsJS.cache.events.oncolumn = -1;
		DocsJS.column.start(-1);
		doc.querySelector('[docsjs-pref="C"]').onclick();
		var width = Math.max(parseInt(doc.querySelector('[docsjs-tag="column-left"]').style.width)*2,300);
		doc.querySelector('[docsjs-tag="column-right"]').style.display = 'none';
		doc.querySelector('[docsjs-tag="column-header"]').style.display = 'none';
		doc.querySelector('[docsjs-tag="column-left"]').style.width = width+'px';
		doc.querySelector('[docsjs-tag="column-left"]').style.display = '';
		DocsJS.forEach(doc.querySelectorAll('main>s-c'),function(el){
			el.style.marginLeft = width+'px';
			el.style.width = DocsJS.window.width()-width+'px';
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
			DocsJS.forEach(doc.querySelectorAll('t-l,[docsjs-tag="ebefore"]'),function(el){
				el.onclick = function(){};
				el.onkeyup = function(){};
			});
		},1000);
	});
	DocsJS.cd.refresh();
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
		DocsJS.scroll(JSON.parse(el.getAttribute('onclick').split("DocsJS._menuClicked(this,")[1].slice(0,-2)));
	}
};

//////////////////////
////// Sidebars //////
//////////////////////

DocsJS.column = {
	start: function(n){
		'use strict';
		DocsJS.apply(function(doc){
			if (n < 0){
				doc.querySelector('[docsjs-tag="column-left"]').innerHTML = DocsJS.column.generate(DocsJS.cache.events.columnchoice,doc);
				if (DocsJS.cache.events.columnchoice !== 'menu'){
					doc.querySelector('[docsjs-tag="column-left"]').style.position = 'absolute';
				} else{
					DocsJS.bindPrefs();
				}
				DocsJS.column.state[0] = DocsJS.cache.events.columnchoice;
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="column-left"] e-g,[docsjs-tag="column-left"] e-x'),function(el){
					el.style.height = el.style.paddingTop = el.style.paddingBottom = el.style.borderTopWidth = el.style.borderBottomWidth = '';
				});
				doc.querySelector('[docsjs-tag="column-left"]').docsjs.state = DocsJS.cache.events.columnchoice;
			} else{
				doc.querySelector('[docsjs-tag="column-right"]').innerHTML = DocsJS.column.generate(DocsJS.cache.events.columnchoice,doc);
				if (DocsJS.cache.events.columnchoice !== 'menu'){
					doc.querySelector('[docsjs-tag="column-right"]').style.position = 'absolute';
				} else{
					DocsJS.bindPrefs();
				}
				doc.querySelector('[docsjs-tag="column-right"]').lastChild.style.marginRight = '-'+(100+DocsJS.cache.extraWidth)+'px';
				DocsJS.column.state[1] = DocsJS.cache.events.columnchoice;
				if (DocsJS.column.state[0] === 'none'){
					doc.querySelector('[docsjs-tag="column-left"]').innerHTML = DocsJS.column.choice(-1);
				}
				DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="column-right"] e-g,[docsjs-tag="column-right"] e-x'),function(el){
					el.style.height = el.style.paddingTop = el.style.paddingBottom = el.style.borderTopWidth = el.style.borderBottomWidth = '';
				});
				doc.querySelector('[docsjs-tag="column-right"]').docsjs.state = DocsJS.cache.events.columnchoice;
			}
		});
		var side = n > 0?'right':'left';
		if (DocsJS.cache.events.columnchoice === 'menu'){
			if (n < 0){
				DocsJS.columnOffsets[side] = -1*DocsJS.cache.extraWidth+170;
			} else{
				DocsJS.columnOffsets[side] = Math.max(-1*DocsJS.cache.extraWidth+170,0);
			}
			DocsJS.cache.events.columnchoice = 0;
			DocsJS.cache.events.oncolumn = 0;
			DocsJS.resized();
		} else{
			DocsJS.columnOffsets[side] = (document.querySelector('s-c').getBoundingClientRect().right - document.querySelector('s-c').getBoundingClientRect().left + document.querySelector('[docsjs-tag="column-'+side+'"]').getBoundingClientRect().right - document.querySelector('[docsjs-tag="column-'+side+'"]').getBoundingClientRect().left - 400 - DocsJS.cache.extraWidth*2)/2;
			
			DocsJS.cache.events.columnchoice = 0;
			DocsJS.cache.events.oncolumn = 0;
			DocsJS.cd.refresh();
			DocsJS.resized();
		}
	},
	stop: function(n){
		'use strict';
		DocsJS.apply(function(doc){
			if (n < 0 && DocsJS.column.state[0] !== 'none'){
				if (DocsJS.column.state[0] !== 'menu'){
					var nodesL = [];
					DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="'+DocsJS.column.state[0]+'-inactive"]'),function(el){
						el.docsjs.tag = 'ebefore';
						el.style.display = '';
						nodesL.push(el.nextSibling);
					});
					DocsJS.forEach(doc.querySelector('[docsjs-tag="column-left"]').querySelectorAll(DocsJS.column.state[0]),function(el,index){
						nodesL[index].parentElement.insertBefore(el,nodesL[index]);
					});
					DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="efiller"][docsjs-side="left"]'),function(el){
						el.style.height = '0px';
					});
				}
				doc.querySelector('[docsjs-tag="column-left"]').style.position = 'fixed';
				doc.querySelector('[docsjs-tag="column-left"]').innerHTML = DocsJS.column.choice(-1);
				DocsJS.column.state[0] = 'none';
				DocsJS.forEach(doc.querySelectorAll('s-c e-g,s-c e-x'),function(el){
					if (el.docsjs.state === 'min'){
						el.style.height = el.style.paddingTop = el.style.paddingBottom = el.style.borderTopWidth = el.style.borderBottomWidth = '0px';
					}
				});
				doc.querySelector('[docsjs-tag="column-left"]').docsjs.state = "none";
				DocsJS.columnOffsets[(n > 0?'right':'left')] = 0;
				DocsJS.resized();
				DocsJS.cd.refresh();
			} else if (DocsJS.column.state[1] !== 'none'){
				if (DocsJS.column.state[1] !== 'menu'){
					var nodesR = [];
					DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="'+DocsJS.column.state[1]+'-inactive"]'),function(el){
						el.docsjs.tag = 'ebefore';
						el.style.display = '';
						nodesR.push(el.nextSibling);
					});
					DocsJS.forEach(doc.querySelector('[docsjs-tag="column-right"]').querySelectorAll(DocsJS.column.state[1]),function(el,index){
						nodesR[index].parentElement.insertBefore(el,nodesR[index]);
					});
					DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="efiller"][docsjs-side="right"]'),function(el){
						el.style.height = '0px';
					});
				}
				doc.querySelector('[docsjs-tag="column-right"]').style.position = 'fixed';
				doc.querySelector('[docsjs-tag="column-right"]').innerHTML = DocsJS.column.choice(1);
				DocsJS.column.state[1] = 'none';
				if (DocsJS.column.state[0] === 'none'){
					doc.querySelector('[docsjs-tag="column-left"]').innerHTML = DocsJS.column.choice(-1);
				}
				DocsJS.forEach(doc.querySelectorAll('s-c e-g,s-c e-x'),function(el){
					if (el.docsjs.state === 'min'){
						el.style.height = el.style.paddingTop = el.style.paddingBottom = el.style.borderTopWidth = el.style.borderBottomWidth = '0px';
					}
				});
				doc.querySelector('[docsjs-tag="column-right"]').docsjs.state = "none";
				DocsJS.columnOffsets[(n > 0?'right':'left')] = 0;
				DocsJS.resized();
				DocsJS.cd.refresh();
			}
		});
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
			return 'onclick="DocsJS.cache.events.columnchoice = \''+name+'\'; DocsJS.cache.events.oncolumn = '+n+'; DocsJS.column.start('+n+');" onmouseover="this.docsjs.tag=\'column-content\'" onmouseout="this.docsjs.tag=\'column-filler\'"';
		};
		var tabs = {
			eg: '<div docsjs-tag="column-filler" style="height:50%; overflow:hidden; cursor:pointer; cursor:pointer;"'+mouseevents('e-g')+'>'+button('eg')+'</div>',
			ex: '<div docsjs-tag="column-filler" style="height:50%; overflow:hidden; cursor:pointer; cursor:pointer;"'+mouseevents('e-x')+'>'+button('ex')+'</div>',
			menuHalf: '<div docsjs-tag="column-filler" style="height:50%; overflow:hidden; cursor:pointer; cursor:pointer;"'+mouseevents('menu')+'>'+button('menu')+'</div>',
			menuFull: '<div docsjs-tag="column-filler" style="height:100%; overflow:hidden; cursor:pointer; cursor:pointer;"'+mouseevents('menu')+'>'+button('menu')+'</div>',
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
			DocsJS.forEach(doc.querySelectorAll(type),function(el){
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
		var close = '<div style="position:absolute;top:0;cursor:pointer;" docsjs-tag="'+(DocsJS.cache.events.oncolumn > 0? 'column-push-right' : '')+'" onclick="DocsJS.column.stop('+DocsJS.cache.events.oncolumn+')">'+DocsJS.buttons.close()+'</div>';
		var move = '<div style="position:absolute;top:0;cursor:ew-resize;" docsjs-tag="'+(DocsJS.cache.events.oncolumn < 0? 'column-push-right' : '')+'" onmousedown="DocsJS.cache.events.columnchoice = \''+type+'\'; DocsJS.cache.events.oncolumn = '+DocsJS.cache.events.oncolumn+';" ontouchstart="DocsJS.cache.events.columnchoice = \''+type+'\'; DocsJS.cache.events.oncolumn = '+DocsJS.cache.events.oncolumn+';" onmouseup="DocsJS.cache.events.columnchoice = 0;DocsJS.cache.events.oncolumn = 0;" ontouchend="DocsJS.cache.events.columnchoice = 0;DocsJS.cache.events.oncolumn = 0;">'+DocsJS.buttons.ewdrag()+'</div>';
		return out+'<div docsjs-tag="column-header" style="top:0;">'+(DocsJS.cache.events.oncolumn > 0? move : close)+' '+(DocsJS[type.replace('-','')].name || 'Menu')+' '+(DocsJS.cache.events.oncolumn < 0? move : close)+'</div>';
	},
	state: ['none','none'],
	align: function (doc){
		'use strict';
		if (doc === undefined){doc = document;}
		var correct = function(side){
			DocsJS.forEach(doc.querySelectorAll('[docsjs-tag="efiller"][docsjs-side="'+side+'"],[docsjs-tag="column-'+side+'"] [docsjs-tag="column-filler"]'),function(el){
				el.style.height = '0px';
			});
			var checkVisible = function(el){
				el = el.parentElement;
				if (el.docsjs !== undefined || el.tagName.toUpperCase() === 'DOCS-JS'){
					if (el.docsjs.state === 'min'){
						columnBox.previousSibling.style.display = 'none';
						columnBox.style.display = 'none';
					} else if (el.tagName.toUpperCase() !== 'DOCS-JS'){
						checkVisible(el);
					}
				} else{
					checkVisible(el);
				}
			};
			var topics = [];
			DocsJS.forEach(doc.querySelectorAll('t-p, h-d'), function(el){
				if (el.querySelector('[docsjs-tag="'+(DocsJS.column.state[(side === 'left'? 0:1)])+'-inactive"]') !== null){
					topics.push(el);
				}
			});
			for (var i = 0; i < doc.querySelectorAll('[docsjs-tag="column-'+side+'"]>[docsjs-tag="column-content"]').length; i++){
				var columnBox = doc.querySelectorAll('[docsjs-tag="column-'+side+'"]>[docsjs-tag="column-content"]')[i];
				var centerBox = topics[i];
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
			doc.querySelector('[docsjs-tag="column-'+side+'"]').lastChild.previousSibling.style.display = '';
			doc.querySelector('[docsjs-tag="column-'+side+'"]').lastChild.previousSibling.style.height = doc.getBoundingClientRect().bottom - doc.querySelector('[docsjs-tag="column-'+side+'"]').lastChild.previousSibling.getBoundingClientRect().bottom +  'px';
			DocsJS.cd.resize();
		};
		if (DocsJS.column.state[0] !== 'none' && DocsJS.column.state[0] !== 'menu'){
			correct('left');
		}
		if (DocsJS.column.state[1] !== 'none' && DocsJS.column.state[1] !== 'menu'){
			correct('right');
		}
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
DocsJS.scroll = function(targ,callback){
	'use strict';
	if (typeof callback !== 'function'){callback = function(){};}
	switch (typeof targ){
		case 'string':
			var names = document.querySelectorAll('[docsjs-tag="menu-title"]');
			for (var n = 0; n < names.length; n++){
				if (names[n].innerText.replace(/(\r\n|\n|\r)/gm,'') === targ){
					DocsJS.scroll(JSON.parse(names[n].docsjs.menuLocation));
					return;
				}
			}
			break;
		case 'number':
			var top = document.querySelector('[docsjs-state="youarehere"]');
			if (top.docsjs.menuLocation === undefined){
				if (DocsJS.window.scrollTop() === 0){
					window.scrollTo(0,1);
					DocsJS.scrolled();
					DocsJS.scroll(targ);
				} else{
					window.scrollTo(0,DocsJS.window.scrollTop()-1);
					DocsJS.scrolled();
					DocsJS.scroll(targ);
				}
			} else if (targ === 0){
				DocsJS.scroll(JSON.parse(top.docsjs.menuLocation));
			} else{
				if (targ > 0){
					for (var g = 0; g < targ; g++){
						while (top.nextSibling === null){
							top = top.parentElement;
						}
						top = top.nextSibling.querySelector('[docsjs-tag="menu-title"]');
						if (top.docsjs.menuLocation === undefined){
							DocsJS.scroll(g);
							return;
						}
					}
					DocsJS.scroll(JSON.parse(top.docsjs.menuLocation));
				} else{
					for (var l = 0; l > targ; l--){
						while (top.previousSibling === null){
							top = top.parentElement;
						}
						top = top.previousSibling;
						var topChildren = top.querySelectorAll('[docsjs-tag="menu-title"]');
						if (topChildren.length !== 0){
							top = topChildren[topChildren.length-1];
						}
						if (top.docsjs.menuLocation === undefined){
							DocsJS.scroll(l);
							return;
						}
					}
					DocsJS.scroll(JSON.parse(top.docsjs.menuLocation));
				}
			}
			break;
		case 'boolean':
			if (targ){
				var scrollTimeT = Math.sqrt(DocsJS.window.scrollTop())/14*DocsJS.animation.duration;
				DocsJS.animate({
					from: DocsJS.window.scrollTop(),
					to: 0,
					duration: scrollTimeT, easing: DocsJS.easings.easeOutQuart,
					step: function(now){
						window.scroll(0,now);
					},
					callback: callback
				});
			} else{
				var btm = document.querySelector('docs-js').clientHeight - DocsJS.window.height();
				var scrollTimeB = Math.sqrt(btm - DocsJS.window.scrollTop())/14*DocsJS.animation.duration;
				DocsJS.animate({
					from: DocsJS.window.scrollTop(),
					to: btm,
					duration: scrollTimeB, easing: DocsJS.easings.easeOutQuart,
					step: function(now){
						window.scroll(0,now);
					},
					callback: callback
				});
			}
			break;
		case 'object':
			if (typeof targ[0] === 'number'){
				var dest = document.querySelectorAll('docs-js')[targ[0]].querySelector('main');
				targ.shift();
				for (var i = 0; i < targ.length; i++){
					var children = dest.querySelectorAll('s-c,t-p');
					var immeditateChildren = [];
					for (var j = 0; j < children.length; j++){
						if (children[j].parentElement === dest){
							immeditateChildren.push(children[j]);
						}
					}
					dest = immeditateChildren[targ[i]];
				}
				dest = dest.querySelector('h-d') || dest;
				var scrollTo = dest.getBoundingClientRect().top - document.body.getBoundingClientRect().top - DocsJS.fontsize._value*DocsJS.fontsize._scalar;
				if (document.querySelector('docs-js').clientHeight - DocsJS.window.height() < scrollTo){
					scrollTo = Math.min(scrollTo, document.querySelector('docs-js').clientHeight - DocsJS.window.height());
				}
				var scrollTime = Math.sqrt(Math.abs(DocsJS.window.scrollTop() - scrollTo))/14*DocsJS.animation.duration;
				DocsJS.animate({
					from: DocsJS.window.scrollTop(),
					to: scrollTo,
					duration: scrollTime, easing: DocsJS.easings.easeOutQuart,
					step: function(now){
						window.scroll(0,now);
					}, callback: callback
				});
			} else if (typeof targ[0] === 'string'){
				var item = document;
				for (var s = 0; s < targ.length; s++){
					var titles = item.querySelectorAll('[docsjs-tag="menu-title"]');
					for (var t = 0; t < titles.length; t++){
						if (titles[t].innerText.replace(/(\r\n|\n|\r)/gm,'') === targ[s]){
							item = titles[t].parentElement;
							t = titles.length;
						}
					}
				}
				DocsJS.scroll(JSON.parse(item.querySelector('[docsjs-tag="menu-title"]').docsjs.menuLocation));
			} else{
				console.error('DocsJS.scroll() Error: passed argument '+targ+' is not a valid type.');
			}
			break;
		default:
			console.error('DocsJS.scroll() Error: passed argument '+targ+' is not a valid type.');
			break;
	}
	DocsJS.events.scroll(targ);
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
		switch (el.tagName.toUpperCase()){
			case 'S-C':
				el.querySelector('h-d').querySelector('t-l').querySelector('[docsjs-tag="button-minimize"]').onclick();
				break;
			case 'H-D':
			case 'T-P':
				el.querySelector('t-l').onclick({target:{docsjs:{tag:'T-L'}}});
				break;
			case 'E-X':
			case 'E-G':
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
				DocsJS.column.align(doc);
			});
		}
	},
	_value: 19,
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
	name: 'Examples',
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
				for (var i = 0; i < DocsJS.cache.aceEditors.length; i++){
					var editor = DocsJS.cache.aceEditors[i];
					editor.destroy();
				}
				DocsJS.forEach(doc.querySelectorAll('c-d'),function(el, index){
					if (el.docsjs.internal !== undefined){
						el.innerHTML = DocsJS.cache.aceEditors[el.docsjs.internal].getValue().replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
							return '&#'+i.charCodeAt(0)+';';
						});
						el.docsjs.internal = index;
					} else{
						el.setAttribute('docsjs-internal',index);
					}
				});
				DocsJS.forEach(doc.querySelectorAll('c-d'),function(el){
					var editor = ace.edit(el);
					el.style.fontSize = '0.8em';
					editor.setTheme("ace/theme/"+(DocsJS.cd.theme || DocsJS.aceTheme[DocsJS.theme] || 'chrome'));
					editor.getSession().setMode("ace/mode/"+el.docsjs.lang);
					editor.getSession().setTabSize(DocsJS.cd.tabSize);
					editor.$blockScrolling = Infinity;
					if (!(el.docsjs.editable === undefined? DocsJS.cd.editable : JSON.parse(el.docsjs.editable))){
						editor.setReadOnly(true);
						editor.renderer.setShowGutter(false);
						editor.setHighlightActiveLine(false);
						editor.renderer.setPadding(parseInt(DocsJS.getStyle(document.querySelector('docs-js'),'font-size')));
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
					editors.push(editor);
				});
				DocsJS.cache.aceEditors = editors;
				DocsJS.cd.resize();
			});
			DocsJS.events.cdRefreshed();
			if (typeof callback === 'function'){
				callback();
			}
		}
	},
	resize: function(callback){
		'use strict';
		DocsJS.forEach(document.querySelectorAll('c-d'),function(el){
			var editor = DocsJS.cd.getEditor(el);
			el.style.height = '';
			el.style.height = (editor.getSession().getDocument().getLength() * editor.renderer.lineHeight + editor.renderer.scrollBar.getWidth())/DocsJS.fontsize._value/DocsJS.fontsize._scalar*1.25 + 'em';
			editor.resize(true);
		});
		if (typeof callback === 'function'){
			callback();
		}
		DocsJS.events.cdResized();
	}
};
DocsJS.menu = {
	top: 'Jump to top',
	bottom: 'Jump to bottom'
};
DocsJS.events = {
	ready: function(){},
	sectionToggle: function(section){'use strict';if (section === 'HTML Node of (un)minimized section'){}},
	topicToggle: function(topic){'use strict';if (topic === 'HTML Node of (un)minimized header or topic'){}},
	menuToggle: function(menu){'use strict';if (menu === 'HTML Node of menu opened/closed'){}},
	eToggle: function(e){'use strict';if (e === 'HTML Node of ex/eg opened/closed'){}},
	cdRefreshed: function(e){'use strict';if (e === 'DocsJS.cd.refresh() has been called and finished.'){}},
	cdResized: function(e){'use strict';if (e === 'DocsJS.cd.resize() has been called and finished.'){}},
	preferenceChanged: function(type){'use strict';if (type === 'The preference changed: Fontsize up || Fontisze down || Minimize all || Minimize half || Minimize none || Invert colors || Lightning || Reset'){}},
	scroll: function(location){'use strict';if (location === 'top || bottom || period-separated location'){}},
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
	ewdrag: function(){
		'use strict';
		var out = document.createElement('div');
		out.innerHTML = DocsJS.buttons.menu.html();
		DocsJS.rotate(out.firstChild,90);
		return out.innerHTML;
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

Date.now||(Date.now=function(){return(new Date).getTime()});
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
	hashChanged: false,
	scrollDebounce: false
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
/*@preserve HTML5 Shiv 3.7.3 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed*/
!function(a,b){function c(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function d(){var a=y.elements;return"string"==typeof a?a.split(" "):a}function e(a,b){var c=y.elements;"string"!=typeof c&&(c=c.join(" ")),"string"!=typeof a&&(a=a.join(" ")),y.elements=c+" "+a,j(b)}function f(a){var b=x[a[v]];return b||(b={},w++,a[v]=w,x[w]=b),b}function g(a,c,d){if(c||(c=b),q)return c.createElement(a);d||(d=f(c));var e;return e=d.cache[a]?d.cache[a].cloneNode():u.test(a)?(d.cache[a]=d.createElem(a)).cloneNode():d.createElem(a),!e.canHaveChildren||t.test(a)||e.tagUrn?e:d.frag.appendChild(e)}function h(a,c){if(a||(a=b),q)return a.createDocumentFragment();c=c||f(a);for(var e=c.frag.cloneNode(),g=0,h=d(),i=h.length;i>g;g++)e.createElement(h[g]);return e}function i(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return y.shivMethods?g(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+d().join().replace(/[\w\-:]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(y,b.frag)}function j(a){a||(a=b);var d=f(a);return!y.shivCSS||p||d.hasCSS||(d.hasCSS=!!c(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),q||i(a,d),a}function k(a){for(var b,c=a.getElementsByTagName("*"),e=c.length,f=RegExp("^(?:"+d().join("|")+")$","i"),g=[];e--;)b=c[e],f.test(b.nodeName)&&g.push(b.applyElement(l(b)));return g}function l(a){for(var b,c=a.attributes,d=c.length,e=a.ownerDocument.createElement(A+":"+a.nodeName);d--;)b=c[d],b.specified&&e.setAttribute(b.nodeName,b.nodeValue);return e.style.cssText=a.style.cssText,e}function m(a){for(var b,c=a.split("{"),e=c.length,f=RegExp("(^|[\\s,>+~])("+d().join("|")+")(?=[[\\s,>+~#.:]|$)","gi"),g="$1"+A+"\\:$2";e--;)b=c[e]=c[e].split("}"),b[b.length-1]=b[b.length-1].replace(f,g),c[e]=b.join("}");return c.join("{")}function n(a){for(var b=a.length;b--;)a[b].removeNode()}function o(a){function b(){clearTimeout(g._removeSheetTimer),d&&d.removeNode(!0),d=null}var d,e,g=f(a),h=a.namespaces,i=a.parentWindow;return!B||a.printShived?a:("undefined"==typeof h[A]&&h.add(A),i.attachEvent("onbeforeprint",function(){b();for(var f,g,h,i=a.styleSheets,j=[],l=i.length,n=Array(l);l--;)n[l]=i[l];for(;h=n.pop();)if(!h.disabled&&z.test(h.media)){try{f=h.imports,g=f.length}catch(o){g=0}for(l=0;g>l;l++)n.push(f[l]);try{j.push(h.cssText)}catch(o){}}j=m(j.reverse().join("")),e=k(a),d=c(a,j)}),i.attachEvent("onafterprint",function(){n(e),clearTimeout(g._removeSheetTimer),g._removeSheetTimer=setTimeout(b,500)}),a.printShived=!0,a)}var p,q,r="3.7.3",s=a.html5||{},t=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,u=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,v="_html5shiv",w=0,x={};!function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",p="hidden"in a,q=1==a.childNodes.length||function(){b.createElement("a");var a=b.createDocumentFragment();return"undefined"==typeof a.cloneNode||"undefined"==typeof a.createDocumentFragment||"undefined"==typeof a.createElement}()}catch(c){p=!0,q=!0}}();var y={elements:s.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video",version:r,shivCSS:s.shivCSS!==!1,supportsUnknownElements:q,shivMethods:s.shivMethods!==!1,type:"default",shivDocument:j,createElement:g,createDocumentFragment:h,addElements:e};a.html5=y,j(b);var z=/^$|\b(?:all|print)\b/,A="html5shiv",B=!q&&function(){var c=b.documentElement;return!("undefined"==typeof b.namespaces||"undefined"==typeof b.parentWindow||"undefined"==typeof c.applyElement||"undefined"==typeof c.removeNode||"undefined"==typeof a.attachEvent)}();y.type+=" print",y.shivPrint=o,o(b),"object"==typeof module&&module.exports&&(module.exports=y)}("undefined"!=typeof window?window:this,document);
/*! showdown v 1.7.4 - 08-09-2017 */
(function(){function a(a){"use strict";var b={omitExtraWLInCodeBlocks:{defaultValue:!1,describe:"Omit the default extra whiteline added to code blocks",type:"boolean"},noHeaderId:{defaultValue:!1,describe:"Turn on/off generated header id",type:"boolean"},prefixHeaderId:{defaultValue:!1,describe:"Add a prefix to the generated header ids. Passing a string will prefix that string to the header id. Setting to true will add a generic 'section-' prefix",type:"string"},rawPrefixHeaderId:{defaultValue:!1,describe:'Setting this option to true will prevent showdown from modifying the prefix. This might result in malformed IDs (if, for instance, the " char is used in the prefix)',type:"boolean"},ghCompatibleHeaderId:{defaultValue:!1,describe:"Generate header ids compatible with github style (spaces are replaced with dashes, a bunch of non alphanumeric chars are removed)",type:"boolean"},rawHeaderId:{defaultValue:!1,describe:"Remove only spaces, ' and \" from generated header ids (including prefixes), replacing them with dashes (-). WARNING: This might result in malformed ids",type:"boolean"},headerLevelStart:{defaultValue:!1,describe:"The header blocks level start",type:"integer"},parseImgDimensions:{defaultValue:!1,describe:"Turn on/off image dimension parsing",type:"boolean"},simplifiedAutoLink:{defaultValue:!1,describe:"Turn on/off GFM autolink style",type:"boolean"},excludeTrailingPunctuationFromURLs:{defaultValue:!1,describe:"Excludes trailing punctuation from links generated with autoLinking",type:"boolean"},literalMidWordUnderscores:{defaultValue:!1,describe:"Parse midword underscores as literal underscores",type:"boolean"},literalMidWordAsterisks:{defaultValue:!1,describe:"Parse midword asterisks as literal asterisks",type:"boolean"},strikethrough:{defaultValue:!1,describe:"Turn on/off strikethrough support",type:"boolean"},tables:{defaultValue:!1,describe:"Turn on/off tables support",type:"boolean"},tablesHeaderId:{defaultValue:!1,describe:"Add an id to table headers",type:"boolean"},ghCodeBlocks:{defaultValue:!0,describe:"Turn on/off GFM fenced code blocks support",type:"boolean"},tasklists:{defaultValue:!1,describe:"Turn on/off GFM tasklist support",type:"boolean"},smoothLivePreview:{defaultValue:!1,describe:"Prevents weird effects in live previews due to incomplete input",type:"boolean"},smartIndentationFix:{defaultValue:!1,description:"Tries to smartly fix indentation in es6 strings",type:"boolean"},disableForced4SpacesIndentedSublists:{defaultValue:!1,description:"Disables the requirement of indenting nested sublists by 4 spaces",type:"boolean"},simpleLineBreaks:{defaultValue:!1,description:"Parses simple line breaks as <br> (GFM Style)",type:"boolean"},requireSpaceBeforeHeadingText:{defaultValue:!1,description:"Makes adding a space between `#` and the header text mandatory (GFM Style)",type:"boolean"},ghMentions:{defaultValue:!1,description:"Enables github @mentions",type:"boolean"},ghMentionsLink:{defaultValue:"https://github.com/{u}",description:"Changes the link generated by @mentions. Only applies if ghMentions option is enabled.",type:"string"},encodeEmails:{defaultValue:!0,description:"Encode e-mail addresses through the use of Character Entities, transforming ASCII e-mail addresses into its equivalent decimal entities",type:"boolean"},openLinksInNewWindow:{defaultValue:!1,description:"Open all links in new windows",type:"boolean"},backslashEscapesHTMLTags:{defaultValue:!1,description:"Support for HTML Tag escaping. ex: <div>foo</div>",type:"boolean"}};if(!1===a)return JSON.parse(JSON.stringify(b));var c={};for(var d in b)b.hasOwnProperty(d)&&(c[d]=b[d].defaultValue);return c}function b(a,b){"use strict";var c=b?"Error in "+b+" extension->":"Error in unnamed extension",e={valid:!0,error:""};d.helper.isArray(a)||(a=[a]);for(var f=0;f<a.length;++f){var g=c+" sub-extension "+f+": ",h=a[f];if("object"!=typeof h)return e.valid=!1,e.error=g+"must be an object, but "+typeof h+" given",e;if(!d.helper.isString(h.type))return e.valid=!1,e.error=g+'property "type" must be a string, but '+typeof h.type+" given",e;var i=h.type=h.type.toLowerCase();if("language"===i&&(i=h.type="lang"),"html"===i&&(i=h.type="output"),"lang"!==i&&"output"!==i&&"listener"!==i)return e.valid=!1,e.error=g+"type "+i+' is not recognized. Valid values: "lang/language", "output/html" or "listener"',e;if("listener"===i){if(d.helper.isUndefined(h.listeners))return e.valid=!1,e.error=g+'. Extensions of type "listener" must have a property called "listeners"',e}else if(d.helper.isUndefined(h.filter)&&d.helper.isUndefined(h.regex))return e.valid=!1,e.error=g+i+' extensions must define either a "regex" property or a "filter" method',e;if(h.listeners){if("object"!=typeof h.listeners)return e.valid=!1,e.error=g+'"listeners" property must be an object but '+typeof h.listeners+" given",e;for(var j in h.listeners)if(h.listeners.hasOwnProperty(j)&&"function"!=typeof h.listeners[j])return e.valid=!1,e.error=g+'"listeners" property must be an hash of [event name]: [callback]. listeners.'+j+" must be a function but "+typeof h.listeners[j]+" given",e}if(h.filter){if("function"!=typeof h.filter)return e.valid=!1,e.error=g+'"filter" must be a function, but '+typeof h.filter+" given",e}else if(h.regex){if(d.helper.isString(h.regex)&&(h.regex=new RegExp(h.regex,"g")),!(h.regex instanceof RegExp))return e.valid=!1,e.error=g+'"regex" property must either be a string or a RegExp object, but '+typeof h.regex+" given",e;if(d.helper.isUndefined(h.replace))return e.valid=!1,e.error=g+'"regex" extensions must implement a replace string or function',e}}return e}function c(a,b){"use strict";return"¨E"+b.charCodeAt(0)+"E"}var d={},e={},f={},g=a(!0),h="vanilla",i={github:{omitExtraWLInCodeBlocks:!0,simplifiedAutoLink:!0,excludeTrailingPunctuationFromURLs:!0,literalMidWordUnderscores:!0,strikethrough:!0,tables:!0,tablesHeaderId:!0,ghCodeBlocks:!0,tasklists:!0,disableForced4SpacesIndentedSublists:!0,simpleLineBreaks:!0,requireSpaceBeforeHeadingText:!0,ghCompatibleHeaderId:!0,ghMentions:!0,backslashEscapesHTMLTags:!0},original:{noHeaderId:!0,ghCodeBlocks:!1},ghost:{omitExtraWLInCodeBlocks:!0,parseImgDimensions:!0,simplifiedAutoLink:!0,excludeTrailingPunctuationFromURLs:!0,literalMidWordUnderscores:!0,strikethrough:!0,tables:!0,tablesHeaderId:!0,ghCodeBlocks:!0,tasklists:!0,smoothLivePreview:!0,simpleLineBreaks:!0,requireSpaceBeforeHeadingText:!0,ghMentions:!1,encodeEmails:!0},vanilla:a(!0),allOn:function(){"use strict";var b=a(!0),c={};for(var d in b)b.hasOwnProperty(d)&&(c[d]=!0);return c}()};d.helper={},d.extensions={},d.setOption=function(a,b){"use strict";return g[a]=b,this},d.getOption=function(a){"use strict";return g[a]},d.getOptions=function(){"use strict";return g},d.resetOptions=function(){"use strict";g=a(!0)},d.setFlavor=function(a){"use strict";if(!i.hasOwnProperty(a))throw Error(a+" flavor was not found");d.resetOptions();var b=i[a];h=a;for(var c in b)b.hasOwnProperty(c)&&(g[c]=b[c])},d.getFlavor=function(){"use strict";return h},d.getFlavorOptions=function(a){"use strict";if(i.hasOwnProperty(a))return i[a]},d.getDefaultOptions=function(b){"use strict";return a(b)},d.subParser=function(a,b){"use strict";if(d.helper.isString(a)){if(void 0===b){if(e.hasOwnProperty(a))return e[a];throw Error("SubParser named "+a+" not registered!")}e[a]=b}},d.extension=function(a,c){"use strict";if(!d.helper.isString(a))throw Error("Extension 'name' must be a string");if(a=d.helper.stdExtName(a),d.helper.isUndefined(c)){if(!f.hasOwnProperty(a))throw Error("Extension named "+a+" is not registered!");return f[a]}"function"==typeof c&&(c=c()),d.helper.isArray(c)||(c=[c]);var e=b(c,a);if(!e.valid)throw Error(e.error);f[a]=c},d.getAllExtensions=function(){"use strict";return f},d.removeExtension=function(a){"use strict";delete f[a]},d.resetExtensions=function(){"use strict";f={}},d.validateExtension=function(a){"use strict";var c=b(a,null);return!!c.valid||(console.warn(c.error),!1)},d.hasOwnProperty("helper")||(d.helper={}),d.helper.isString=function(a){"use strict";return"string"==typeof a||a instanceof String},d.helper.isFunction=function(a){"use strict";var b={};return a&&"[object Function]"===b.toString.call(a)},d.helper.isArray=function(a){"use strict";return Array.isArray(a)},d.helper.isUndefined=function(a){"use strict";return void 0===a},d.helper.forEach=function(a,b){"use strict";if(d.helper.isUndefined(a))throw new Error("obj param is required");if(d.helper.isUndefined(b))throw new Error("callback param is required");if(!d.helper.isFunction(b))throw new Error("callback param must be a function/closure");if("function"==typeof a.forEach)a.forEach(b);else if(d.helper.isArray(a))for(var c=0;c<a.length;c++)b(a[c],c,a);else{if("object"!=typeof a)throw new Error("obj does not seem to be an array or an iterable object");for(var e in a)a.hasOwnProperty(e)&&b(a[e],e,a)}},d.helper.stdExtName=function(a){"use strict";return a.replace(/[_?*+\/\\.^-]/g,"").replace(/\s/g,"").toLowerCase()},d.helper.escapeCharactersCallback=c,d.helper.escapeCharacters=function(a,b,d){"use strict";var e="(["+b.replace(/([\[\]\\])/g,"\\$1")+"])";d&&(e="\\\\"+e);var f=new RegExp(e,"g");return a=a.replace(f,c)};var j=function(a,b,c,d){"use strict";var e,f,g,h,i,j=d||"",k=j.indexOf("g")>-1,l=new RegExp(b+"|"+c,"g"+j.replace(/g/g,"")),m=new RegExp(b,j.replace(/g/g,"")),n=[];do{for(e=0;g=l.exec(a);)if(m.test(g[0]))e++||(f=l.lastIndex,h=f-g[0].length);else if(e&&!--e){i=g.index+g[0].length;var o={left:{start:h,end:f},match:{start:f,end:g.index},right:{start:g.index,end:i},wholeMatch:{start:h,end:i}};if(n.push(o),!k)return n}}while(e&&(l.lastIndex=f));return n};d.helper.matchRecursiveRegExp=function(a,b,c,d){"use strict";for(var e=j(a,b,c,d),f=[],g=0;g<e.length;++g)f.push([a.slice(e[g].wholeMatch.start,e[g].wholeMatch.end),a.slice(e[g].match.start,e[g].match.end),a.slice(e[g].left.start,e[g].left.end),a.slice(e[g].right.start,e[g].right.end)]);return f},d.helper.replaceRecursiveRegExp=function(a,b,c,e,f){"use strict";if(!d.helper.isFunction(b)){var g=b;b=function(){return g}}var h=j(a,c,e,f),i=a,k=h.length;if(k>0){var l=[];0!==h[0].wholeMatch.start&&l.push(a.slice(0,h[0].wholeMatch.start));for(var m=0;m<k;++m)l.push(b(a.slice(h[m].wholeMatch.start,h[m].wholeMatch.end),a.slice(h[m].match.start,h[m].match.end),a.slice(h[m].left.start,h[m].left.end),a.slice(h[m].right.start,h[m].right.end))),m<k-1&&l.push(a.slice(h[m].wholeMatch.end,h[m+1].wholeMatch.start));h[k-1].wholeMatch.end<a.length&&l.push(a.slice(h[k-1].wholeMatch.end)),i=l.join("")}return i},d.helper.regexIndexOf=function(a,b,c){"use strict";if(!d.helper.isString(a))throw"InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";if(b instanceof RegExp==!1)throw"InvalidArgumentError: second parameter of showdown.helper.regexIndexOf function must be an instance of RegExp";var e=a.substring(c||0).search(b);return e>=0?e+(c||0):e},d.helper.splitAtIndex=function(a,b){"use strict";if(!d.helper.isString(a))throw"InvalidArgumentError: first parameter of showdown.helper.regexIndexOf function must be a string";return[a.substring(0,b),a.substring(b)]},d.helper.encodeEmailAddress=function(a){"use strict";var b=[function(a){return"&#"+a.charCodeAt(0)+";"},function(a){return"&#x"+a.charCodeAt(0).toString(16)+";"},function(a){return a}];return a=a.replace(/./g,function(a){if("@"===a)a=b[Math.floor(2*Math.random())](a);else{var c=Math.random();a=c>.9?b[2](a):c>.45?b[1](a):b[0](a)}return a})},"undefined"==typeof console&&(console={warn:function(a){"use strict";alert(a)},log:function(a){"use strict";alert(a)},error:function(a){"use strict";throw a}}),d.helper.regexes={asteriskAndDash:/([*_])/g},d.Converter=function(a){"use strict";function c(a,c){if(c=c||null,d.helper.isString(a)){if(a=d.helper.stdExtName(a),c=a,d.extensions[a])return console.warn("DEPRECATION WARNING: "+a+" is an old extension that uses a deprecated loading method.Please inform the developer that the extension should be updated!"),void e(d.extensions[a],a);if(d.helper.isUndefined(f[a]))throw Error('Extension "'+a+'" could not be loaded. It was either not found or is not a valid extension.');a=f[a]}"function"==typeof a&&(a=a()),d.helper.isArray(a)||(a=[a]);var g=b(a,c);if(!g.valid)throw Error(g.error);for(var h=0;h<a.length;++h){switch(a[h].type){case"lang":m.push(a[h]);break;case"output":n.push(a[h])}if(a[h].hasOwnProperty("listeners"))for(var i in a[h].listeners)a[h].listeners.hasOwnProperty(i)&&j(i,a[h].listeners[i])}}function e(a,c){"function"==typeof a&&(a=a(new d.Converter)),d.helper.isArray(a)||(a=[a]);var e=b(a,c);if(!e.valid)throw Error(e.error);for(var f=0;f<a.length;++f)switch(a[f].type){case"lang":m.push(a[f]);break;case"output":n.push(a[f]);break;default:throw Error("Extension loader error: Type unrecognized!!!")}}function j(a,b){if(!d.helper.isString(a))throw Error("Invalid argument in converter.listen() method: name must be a string, but "+typeof a+" given");if("function"!=typeof b)throw Error("Invalid argument in converter.listen() method: callback must be a function, but "+typeof b+" given");o.hasOwnProperty(a)||(o[a]=[]),o[a].push(b)}function k(a){var b=a.match(/^\s*/)[0].length,c=new RegExp("^\\s{0,"+b+"}","gm");return a.replace(c,"")}var l={},m=[],n=[],o={},p=h;!function(){a=a||{};for(var b in g)g.hasOwnProperty(b)&&(l[b]=g[b]);if("object"!=typeof a)throw Error("Converter expects the passed parameter to be an object, but "+typeof a+" was passed instead.");for(var e in a)a.hasOwnProperty(e)&&(l[e]=a[e]);l.extensions&&d.helper.forEach(l.extensions,c)}(),this._dispatch=function(a,b,c,d){if(o.hasOwnProperty(a))for(var e=0;e<o[a].length;++e){var f=o[a][e](a,b,this,c,d);f&&void 0!==f&&(b=f)}return b},this.listen=function(a,b){return j(a,b),this},this.makeHtml=function(a){if(!a)return a;var b={gHtmlBlocks:[],gHtmlMdBlocks:[],gHtmlSpans:[],gUrls:{},gTitles:{},gDimensions:{},gListLevel:0,hashLinkCounts:{},langExtensions:m,outputModifiers:n,converter:this,ghCodeBlocks:[]};return a=a.replace(/¨/g,"¨T"),a=a.replace(/\$/g,"¨D"),a=a.replace(/\r\n/g,"\n"),a=a.replace(/\r/g,"\n"),a=a.replace(/\u00A0/g," "),l.smartIndentationFix&&(a=k(a)),a="\n\n"+a+"\n\n",a=d.subParser("detab")(a,l,b),a=a.replace(/^[ \t]+$/gm,""),d.helper.forEach(m,function(c){a=d.subParser("runExtension")(c,a,l,b)}),a=d.subParser("hashPreCodeTags")(a,l,b),a=d.subParser("githubCodeBlocks")(a,l,b),a=d.subParser("hashHTMLBlocks")(a,l,b),a=d.subParser("hashCodeTags")(a,l,b),a=d.subParser("stripLinkDefinitions")(a,l,b),a=d.subParser("blockGamut")(a,l,b),a=d.subParser("unhashHTMLSpans")(a,l,b),a=d.subParser("unescapeSpecialChars")(a,l,b),a=a.replace(/¨D/g,"$$"),a=a.replace(/¨T/g,"¨"),d.helper.forEach(n,function(c){a=d.subParser("runExtension")(c,a,l,b)}),a},this.setOption=function(a,b){l[a]=b},this.getOption=function(a){return l[a]},this.getOptions=function(){return l},this.addExtension=function(a,b){b=b||null,c(a,b)},this.useExtension=function(a){c(a)},this.setFlavor=function(a){if(!i.hasOwnProperty(a))throw Error(a+" flavor was not found");var b=i[a];p=a;for(var c in b)b.hasOwnProperty(c)&&(l[c]=b[c])},this.getFlavor=function(){return p},this.removeExtension=function(a){d.helper.isArray(a)||(a=[a]);for(var b=0;b<a.length;++b){for(var c=a[b],e=0;e<m.length;++e)m[e]===c&&m[e].splice(e,1);for(;0<n.length;++e)n[0]===c&&n[0].splice(e,1)}},this.getAllExtensions=function(){return{language:m,output:n}}},d.subParser("anchors",function(a,b,c){"use strict";a=c.converter._dispatch("anchors.before",a,b,c);var e=function(a,e,f,g,h,i,j){if(d.helper.isUndefined(j)&&(j=""),f=f.toLowerCase(),a.search(/\(<?\s*>? ?(['"].*['"])?\)$/m)>-1)g="";else if(!g){if(f||(f=e.toLowerCase().replace(/ ?\n/g," ")),g="#"+f,d.helper.isUndefined(c.gUrls[f]))return a;g=c.gUrls[f],d.helper.isUndefined(c.gTitles[f])||(j=c.gTitles[f])}g=g.replace(d.helper.regexes.asteriskAndDash,d.helper.escapeCharactersCallback);var k='<a href="'+g+'"';return""!==j&&null!==j&&(j=j.replace(/"/g,"&quot;"),j=j.replace(d.helper.regexes.asteriskAndDash,d.helper.escapeCharactersCallback),k+=' title="'+j+'"'),b.openLinksInNewWindow&&(k+=' target="¨E95Eblank"'),k+=">"+e+"</a>"};return a=a.replace(/\[((?:\[[^\]]*]|[^\[\]])*)] ?(?:\n *)?\[(.*?)]()()()()/g,e),a=a.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<([^>]*)>(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,e),a=a.replace(/\[((?:\[[^\]]*]|[^\[\]])*)]()[ \t]*\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?:[ \t]*((["'])([^"]*?)\5))?[ \t]?\)/g,e),a=a.replace(/\[([^\[\]]+)]()()()()()/g,e),b.ghMentions&&(a=a.replace(/(^|\s)(\\)?(@([a-z\d\-]+))(?=[.!?;,[\]()]|\s|$)/gim,function(a,c,e,f,g){if("\\"===e)return c+f;if(!d.helper.isString(b.ghMentionsLink))throw new Error("ghMentionsLink option must be a string");var h=b.ghMentionsLink.replace(/\{u}/g,g),i="";return b.openLinksInNewWindow&&(i=' target="¨E95Eblank"'),c+'<a href="'+h+'"'+i+">"+f+"</a>"})),a=c.converter._dispatch("anchors.after",a,b,c)});var k=/\b(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+)()(?=\s|$)(?!["<>])/gi,l=/\b(((https?|ftp|dict):\/\/|www\.)[^'">\s]+\.[^'">\s]+?)([.!?,()\[\]]?)(?=\s|$)(?!["<>])/gi,m=/<(((https?|ftp|dict):\/\/|www\.)[^'">\s]+)()>/gi,n=/(^|\s)(?:mailto:)?([A-Za-z0-9!#$%&'*+-\/=?^_`{|}~.]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)(?=$|\s)/gim,o=/<()(?:mailto:)?([-.\w]+@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,p=function(a){"use strict";return function(b,c,d,e,f){var g=c,h="",i="";return/^www\./i.test(c)&&(c=c.replace(/^www\./i,"http://www.")),a.excludeTrailingPunctuationFromURLs&&f&&(h=f),a.openLinksInNewWindow&&(i=' target="¨E95Eblank"'),'<a href="'+c+'"'+i+">"+g+"</a>"+h}},q=function(a,b){"use strict";return function(c,e,f){var g="mailto:";return e=e||"",f=d.subParser("unescapeSpecialChars")(f,a,b),a.encodeEmails?(g=d.helper.encodeEmailAddress(g+f),f=d.helper.encodeEmailAddress(f)):g+=f,e+'<a href="'+g+'">'+f+"</a>"}};d.subParser("autoLinks",function(a,b,c){"use strict";return a=c.converter._dispatch("autoLinks.before",a,b,c),a=a.replace(m,p(b)),a=a.replace(o,q(b,c)),a=c.converter._dispatch("autoLinks.after",a,b,c)}),d.subParser("simplifiedAutoLinks",function(a,b,c){"use strict";return b.simplifiedAutoLink?(a=c.converter._dispatch("simplifiedAutoLinks.before",a,b,c),a=b.excludeTrailingPunctuationFromURLs?a.replace(l,p(b)):a.replace(k,p(b)),a=a.replace(n,q(b,c)),a=c.converter._dispatch("simplifiedAutoLinks.after",a,b,c)):a}),d.subParser("blockGamut",function(a,b,c){"use strict";return a=c.converter._dispatch("blockGamut.before",a,b,c),a=d.subParser("blockQuotes")(a,b,c),a=d.subParser("headers")(a,b,c),a=d.subParser("horizontalRule")(a,b,c),a=d.subParser("lists")(a,b,c),a=d.subParser("codeBlocks")(a,b,c),a=d.subParser("tables")(a,b,c),a=d.subParser("hashHTMLBlocks")(a,b,c),a=d.subParser("paragraphs")(a,b,c),a=c.converter._dispatch("blockGamut.after",a,b,c)}),d.subParser("blockQuotes",function(a,b,c){"use strict";return a=c.converter._dispatch("blockQuotes.before",a,b,c),a=a.replace(/((^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+)/gm,function(a,e){var f=e;return f=f.replace(/^[ \t]*>[ \t]?/gm,"¨0"),f=f.replace(/¨0/g,""),f=f.replace(/^[ \t]+$/gm,""),f=d.subParser("githubCodeBlocks")(f,b,c),f=d.subParser("blockGamut")(f,b,c),f=f.replace(/(^|\n)/g,"$1  "),f=f.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm,function(a,b){var c=b;return c=c.replace(/^  /gm,"¨0"),c=c.replace(/¨0/g,"")}),d.subParser("hashBlock")("<blockquote>\n"+f+"\n</blockquote>",b,c)}),a=c.converter._dispatch("blockQuotes.after",a,b,c)}),d.subParser("codeBlocks",function(a,b,c){"use strict";a=c.converter._dispatch("codeBlocks.before",a,b,c),a+="¨0";var e=/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;return a=a.replace(e,function(a,e,f){var g=e,h=f,i="\n";return g=d.subParser("outdent")(g,b,c),g=d.subParser("encodeCode")(g,b,c),g=d.subParser("detab")(g,b,c),g=g.replace(/^\n+/g,""),g=g.replace(/\n+$/g,""),b.omitExtraWLInCodeBlocks&&(i=""),g="<pre><code>"+g+i+"</code></pre>",d.subParser("hashBlock")(g,b,c)+h}),a=a.replace(/¨0/,""),a=c.converter._dispatch("codeBlocks.after",a,b,c)}),d.subParser("codeSpans",function(a,b,c){"use strict";return a=c.converter._dispatch("codeSpans.before",a,b,c),void 0===a&&(a=""),a=a.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,function(a,e,f,g){var h=g;return h=h.replace(/^([ \t]*)/g,""),h=h.replace(/[ \t]*$/g,""),h=d.subParser("encodeCode")(h,b,c),e+"<code>"+h+"</code>"}),a=c.converter._dispatch("codeSpans.after",a,b,c)}),d.subParser("detab",function(a,b,c){"use strict";return a=c.converter._dispatch("detab.before",a,b,c),a=a.replace(/\t(?=\t)/g,"    "),a=a.replace(/\t/g,"¨A¨B"),a=a.replace(/¨B(.+?)¨A/g,function(a,b){for(var c=b,d=4-c.length%4,e=0;e<d;e++)c+=" ";return c}),a=a.replace(/¨A/g,"    "),a=a.replace(/¨B/g,""),a=c.converter._dispatch("detab.after",a,b,c)}),d.subParser("encodeAmpsAndAngles",function(a,b,c){"use strict";return a=c.converter._dispatch("encodeAmpsAndAngles.before",a,b,c),a=a.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;"),a=a.replace(/<(?![a-z\/?$!])/gi,"&lt;"),a=a.replace(/</g,"&lt;"),a=a.replace(/>/g,"&gt;"),a=c.converter._dispatch("encodeAmpsAndAngles.after",a,b,c)}),d.subParser("encodeBackslashEscapes",function(a,b,c){"use strict";return a=c.converter._dispatch("encodeBackslashEscapes.before",a,b,c),a=a.replace(/\\(\\)/g,d.helper.escapeCharactersCallback),a=a.replace(/\\([`*_{}\[\]()>#+.!~=|-])/g,d.helper.escapeCharactersCallback),a=c.converter._dispatch("encodeBackslashEscapes.after",a,b,c)}),d.subParser("encodeCode",function(a,b,c){"use strict";return a=c.converter._dispatch("encodeCode.before",a,b,c),a=a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/([*_{}\[\]\\=~-])/g,d.helper.escapeCharactersCallback),a=c.converter._dispatch("encodeCode.after",a,b,c)}),d.subParser("escapeSpecialCharsWithinTagAttributes",function(a,b,c){"use strict";a=c.converter._dispatch("escapeSpecialCharsWithinTagAttributes.before",a,b,c);var e=/(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;return a=a.replace(e,function(a){return a.replace(/(.)<\/?code>(?=.)/g,"$1`").replace(/([\\`*_~=|])/g,d.helper.escapeCharactersCallback)}),a=c.converter._dispatch("escapeSpecialCharsWithinTagAttributes.after",a,b,c)}),d.subParser("githubCodeBlocks",function(a,b,c){"use strict";return b.ghCodeBlocks?(a=c.converter._dispatch("githubCodeBlocks.before",a,b,c),a+="¨0",a=a.replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g,function(a,e,f){var g=b.omitExtraWLInCodeBlocks?"":"\n";return f=d.subParser("encodeCode")(f,b,c),f=d.subParser("detab")(f,b,c),f=f.replace(/^\n+/g,""),f=f.replace(/\n+$/g,""),f="<pre><code"+(e?' class="'+e+" language-"+e+'"':"")+">"+f+g+"</code></pre>",f=d.subParser("hashBlock")(f,b,c),"\n\n¨G"+(c.ghCodeBlocks.push({text:a,codeblock:f})-1)+"G\n\n"}),a=a.replace(/¨0/,""),c.converter._dispatch("githubCodeBlocks.after",a,b,c)):a}),d.subParser("hashBlock",function(a,b,c){"use strict";return a=c.converter._dispatch("hashBlock.before",a,b,c),a=a.replace(/(^\n+|\n+$)/g,""),a="\n\n¨K"+(c.gHtmlBlocks.push(a)-1)+"K\n\n",a=c.converter._dispatch("hashBlock.after",a,b,c)}),d.subParser("hashCodeTags",function(a,b,c){"use strict";a=c.converter._dispatch("hashCodeTags.before",a,b,c);var e=function(a,e,f,g){var h=f+d.subParser("encodeCode")(e,b,c)+g;return"¨C"+(c.gHtmlSpans.push(h)-1)+"C"};return a=d.helper.replaceRecursiveRegExp(a,e,"<code\\b[^>]*>","</code>","gim"),a=c.converter._dispatch("hashCodeTags.after",a,b,c)}),d.subParser("hashElement",function(a,b,c){"use strict";return function(a,b){var d=b;return d=d.replace(/\n\n/g,"\n"),d=d.replace(/^\n/,""),d=d.replace(/\n+$/g,""),d="\n\n¨K"+(c.gHtmlBlocks.push(d)-1)+"K\n\n"}}),d.subParser("hashHTMLBlocks",function(a,b,c){"use strict";a=c.converter._dispatch("hashHTMLBlocks.before",a,b,c);var e=["pre","div","h1","h2","h3","h4","h5","h6","blockquote","table","dl","ol","ul","script","noscript","form","fieldset","iframe","math","style","section","header","footer","nav","article","aside","address","audio","canvas","figure","hgroup","output","video","p"],f=function(a,b,d,e){var f=a;return-1!==d.search(/\bmarkdown\b/)&&(f=d+c.converter.makeHtml(b)+e),"\n\n¨K"+(c.gHtmlBlocks.push(f)-1)+"K\n\n"};b.backslashEscapesHTMLTags&&(a=a.replace(/\\<(\/?[^>]+?)>/g,function(a,b){return"&lt;"+b+"&gt;"}));for(var g=0;g<e.length;++g)for(var h,i=new RegExp("^ {0,3}(<"+e[g]+"\\b[^>]*>)","im"),j="<"+e[g]+"\\b[^>]*>",k="</"+e[g]+">";-1!==(h=d.helper.regexIndexOf(a,i));){var l=d.helper.splitAtIndex(a,h),m=d.helper.replaceRecursiveRegExp(l[1],f,j,k,"im");if(m===l[1])break;a=l[0].concat(m)}return a=a.replace(/(\n {0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,d.subParser("hashElement")(a,b,c)),a=d.helper.replaceRecursiveRegExp(a,function(a){return"\n\n¨K"+(c.gHtmlBlocks.push(a)-1)+"K\n\n"},"^ {0,3}\x3c!--","--\x3e","gm"),a=a.replace(/(?:\n\n)( {0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,d.subParser("hashElement")(a,b,c)),a=c.converter._dispatch("hashHTMLBlocks.after",a,b,c)}),d.subParser("hashHTMLSpans",function(a,b,c){"use strict";function d(a){return"¨C"+(c.gHtmlSpans.push(a)-1)+"C"}return a=c.converter._dispatch("hashHTMLSpans.before",a,b,c),a=a.replace(/<[^>]+?\/>/gi,function(a){return d(a)}),a=a.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g,function(a){return d(a)}),a=a.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g,function(a){return d(a)}),a=a.replace(/<[^>]+?>/gi,function(a){return d(a)}),a=c.converter._dispatch("hashHTMLSpans.after",a,b,c)}),d.subParser("unhashHTMLSpans",function(a,b,c){"use strict";a=c.converter._dispatch("unhashHTMLSpans.before",a,b,c);for(var d=0;d<c.gHtmlSpans.length;++d){for(var e=c.gHtmlSpans[d],f=0;/¨C(\d+)C/.test(e);){var g=RegExp.$1;if(e=e.replace("¨C"+g+"C",c.gHtmlSpans[g]),10===f)break;++f}a=a.replace("¨C"+d+"C",e)}return a=c.converter._dispatch("unhashHTMLSpans.after",a,b,c)}),d.subParser("hashPreCodeTags",function(a,b,c){"use strict";a=c.converter._dispatch("hashPreCodeTags.before",a,b,c);var e=function(a,e,f,g){var h=f+d.subParser("encodeCode")(e,b,c)+g;return"\n\n¨G"+(c.ghCodeBlocks.push({text:a,codeblock:h})-1)+"G\n\n"};return a=d.helper.replaceRecursiveRegExp(a,e,"^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>","^ {0,3}</code>\\s*</pre>","gim"),a=c.converter._dispatch("hashPreCodeTags.after",a,b,c)}),d.subParser("headers",function(a,b,c){"use strict";function e(a){var e,f;if(b.customizedHeaderId){var g=a.match(/\{([^{]+?)}\s*$/);g&&g[1]&&(a=g[1])}return e=a,f=d.helper.isString(b.prefixHeaderId)?b.prefixHeaderId:!0===b.prefixHeaderId?"section-":"",b.rawPrefixHeaderId||(e=f+e),e=b.ghCompatibleHeaderId?e.replace(/ /g,"-").replace(/&amp;/g,"").replace(/¨T/g,"").replace(/¨D/g,"").replace(/[&+$,\/:;=?@"#{}|^¨~\[\]`\\*)(%.!'<>]/g,"").toLowerCase():b.rawHeaderId?e.replace(/ /g,"-").replace(/&amp;/g,"&").replace(/¨T/g,"¨").replace(/¨D/g,"$").replace(/["']/g,"-").toLowerCase():e.replace(/[^\w]/g,"").toLowerCase(),b.rawPrefixHeaderId&&(e=f+e),c.hashLinkCounts[e]?e=e+"-"+c.hashLinkCounts[e]++:c.hashLinkCounts[e]=1,e}a=c.converter._dispatch("headers.before",a,b,c);var f=isNaN(parseInt(b.headerLevelStart))?1:parseInt(b.headerLevelStart),g=b.smoothLivePreview?/^(.+)[ \t]*\n={2,}[ \t]*\n+/gm:/^(.+)[ \t]*\n=+[ \t]*\n+/gm,h=b.smoothLivePreview?/^(.+)[ \t]*\n-{2,}[ \t]*\n+/gm:/^(.+)[ \t]*\n-+[ \t]*\n+/gm;a=a.replace(g,function(a,g){var h=d.subParser("spanGamut")(g,b,c),i=b.noHeaderId?"":' id="'+e(g)+'"',j=f,k="<h"+j+i+">"+h+"</h"+j+">";return d.subParser("hashBlock")(k,b,c)}),a=a.replace(h,function(a,g){var h=d.subParser("spanGamut")(g,b,c),i=b.noHeaderId?"":' id="'+e(g)+'"',j=f+1,k="<h"+j+i+">"+h+"</h"+j+">";return d.subParser("hashBlock")(k,b,c)});var i=b.requireSpaceBeforeHeadingText?/^(#{1,6})[ \t]+(.+?)[ \t]*#*\n+/gm:/^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm;return a=a.replace(i,function(a,g,h){var i=h;b.customizedHeaderId&&(i=h.replace(/\s?\{([^{]+?)}\s*$/,""));var j=d.subParser("spanGamut")(i,b,c),k=b.noHeaderId?"":' id="'+e(h)+'"',l=f-1+g.length,m="<h"+l+k+">"+j+"</h"+l+">";return d.subParser("hashBlock")(m,b,c)}),a=c.converter._dispatch("headers.after",a,b,c)}),d.subParser("horizontalRule",function(a,b,c){"use strict";a=c.converter._dispatch("horizontalRule.before",a,b,c);var e=d.subParser("hashBlock")("<hr />",b,c);return a=a.replace(/^ {0,2}( ?-){3,}[ \t]*$/gm,e),a=a.replace(/^ {0,2}( ?\*){3,}[ \t]*$/gm,e),a=a.replace(/^ {0,2}( ?_){3,}[ \t]*$/gm,e),a=c.converter._dispatch("horizontalRule.after",a,b,c)}),d.subParser("images",function(a,b,c){"use strict";function e(a,b,c,d,e,g,h,i){return d=d.replace(/\s/g,""),f(a,b,c,d,e,g,h,i)}function f(a,b,e,f,g,h,i,j){var k=c.gUrls,l=c.gTitles,m=c.gDimensions;if(e=e.toLowerCase(),j||(j=""),a.search(/\(<?\s*>? ?(['"].*['"])?\)$/m)>-1)f="";else if(""===f||null===f){if(""!==e&&null!==e||(e=b.toLowerCase().replace(/ ?\n/g," ")),f="#"+e,d.helper.isUndefined(k[e]))return a;f=k[e],d.helper.isUndefined(l[e])||(j=l[e]),d.helper.isUndefined(m[e])||(g=m[e].width,h=m[e].height)}b=b.replace(/"/g,"&quot;").replace(d.helper.regexes.asteriskAndDash,d.helper.escapeCharactersCallback),f=f.replace(d.helper.regexes.asteriskAndDash,d.helper.escapeCharactersCallback);var n='<img src="'+f+'" alt="'+b+'"';return j&&(j=j.replace(/"/g,"&quot;").replace(d.helper.regexes.asteriskAndDash,d.helper.escapeCharactersCallback),n+=' title="'+j+'"'),g&&h&&(g="*"===g?"auto":g,h="*"===h?"auto":h,n+=' width="'+g+'"',n+=' height="'+h+'"'),n+=" />"}a=c.converter._dispatch("images.before",a,b,c);var g=/!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,h=/!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g,i=/!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+\/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,j=/!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g,k=/!\[([^\[\]]+)]()()()()()/g;return a=a.replace(j,f),a=a.replace(i,e),a=a.replace(h,f),a=a.replace(g,f),a=a.replace(k,f),a=c.converter._dispatch("images.after",a,b,c)}),d.subParser("italicsAndBold",function(a,b,c){"use strict";function e(a,e,f){return b.simplifiedAutoLink&&(a=d.subParser("simplifiedAutoLinks")(a,b,c)),e+a+f}return a=c.converter._dispatch("italicsAndBold.before",a,b,c),b.literalMidWordUnderscores?(a=a.replace(/\b___(\S[\s\S]*)___\b/g,function(a,b){return e(b,"<strong><em>","</em></strong>")}),a=a.replace(/\b__(\S[\s\S]*)__\b/g,function(a,b){return e(b,"<strong>","</strong>")}),a=a.replace(/\b_(\S[\s\S]*?)_\b/g,function(a,b){return e(b,"<em>","</em>")})):(a=a.replace(/___(\S[\s\S]*?)___/g,function(a,b){return/\S$/.test(b)?e(b,"<strong><em>","</em></strong>"):a}),a=a.replace(/__(\S[\s\S]*?)__/g,function(a,b){return/\S$/.test(b)?e(b,"<strong>","</strong>"):a}),a=a.replace(/_([^\s_][\s\S]*?)_/g,function(a,b){return/\S$/.test(b)?e(b,"<em>","</em>"):a})),b.literalMidWordAsterisks?(a=a.trim().replace(/(^| )\*{3}(\S[\s\S]*?)\*{3}([ ,;!?.]|$)/g,function(a,b,c,d){return e(c,b+"<strong><em>","</em></strong>"+d)}),a=a.trim().replace(/(^| )\*{2}(\S[\s\S]*?)\*{2}([ ,;!?.]|$)/g,function(a,b,c,d){return e(c,b+"<strong>","</strong>"+d)}),a=a.trim().replace(/(^| )\*(\S[\s\S]*?)\*([ ,;!?.]|$)/g,function(a,b,c,d){return e(c,b+"<em>","</em>"+d)})):(a=a.replace(/\*\*\*(\S[\s\S]*?)\*\*\*/g,function(a,b){return/\S$/.test(b)?e(b,"<strong><em>","</em></strong>"):a}),a=a.replace(/\*\*(\S[\s\S]*?)\*\*/g,function(a,b){return/\S$/.test(b)?e(b,"<strong>","</strong>"):a}),a=a.replace(/\*([^\s*][\s\S]*?)\*/g,function(a,b){return/\S$/.test(b)?e(b,"<em>","</em>"):a})),a=c.converter._dispatch("italicsAndBold.after",a,b,c)}),d.subParser("lists",function(a,b,c){"use strict";function e(a,e){c.gListLevel++,a=a.replace(/\n{2,}$/,"\n"),a+="¨0";var f=/(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0| {0,3}([*+-]|\d+[.])[ \t]+))/gm,g=/\n[ \t]*\n(?!¨0)/.test(a);return b.disableForced4SpacesIndentedSublists&&(f=/(\n)?(^ {0,3})([*+-]|\d+[.])[ \t]+((\[(x|X| )?])?[ \t]*[^\r]+?(\n{1,2}))(?=\n*(¨0|\2([*+-]|\d+[.])[ \t]+))/gm),a=a.replace(f,function(a,e,f,h,i,j,k){k=k&&""!==k.trim()
;var l=d.subParser("outdent")(i,b,c),m="";return j&&b.tasklists&&(m=' class="task-list-item" style="list-style-type: none;"',l=l.replace(/^[ \t]*\[(x|X| )?]/m,function(){var a='<input type="checkbox" disabled style="margin: 0px 0.35em 0.25em -1.6em; vertical-align: middle;"';return k&&(a+=" checked"),a+=">"})),l=l.replace(/^([-*+]|\d\.)[ \t]+[\S\n ]*/g,function(a){return"¨A"+a}),e||l.search(/\n{2,}/)>-1?(l=d.subParser("githubCodeBlocks")(l,b,c),l=d.subParser("blockGamut")(l,b,c)):(l=d.subParser("lists")(l,b,c),l=l.replace(/\n$/,""),l=d.subParser("hashHTMLBlocks")(l,b,c),l=l.replace(/\n\n+/g,"\n\n"),l=g?d.subParser("paragraphs")(l,b,c):d.subParser("spanGamut")(l,b,c)),l=l.replace("¨A",""),l="<li"+m+">"+l+"</li>\n"}),a=a.replace(/¨0/g,""),c.gListLevel--,e&&(a=a.replace(/\s+$/,"")),a}function f(a,c,d){var f=b.disableForced4SpacesIndentedSublists?/^ ?\d+\.[ \t]/gm:/^ {0,3}\d+\.[ \t]/gm,g=b.disableForced4SpacesIndentedSublists?/^ ?[*+-][ \t]/gm:/^ {0,3}[*+-][ \t]/gm,h="ul"===c?f:g,i="";return-1!==a.search(h)?function a(b){var j=b.search(h);-1!==j?(i+="\n<"+c+">\n"+e(b.slice(0,j),!!d)+"</"+c+">\n",c="ul"===c?"ol":"ul",h="ul"===c?f:g,a(b.slice(j))):i+="\n<"+c+">\n"+e(b,!!d)+"</"+c+">\n"}(a):i="\n<"+c+">\n"+e(a,!!d)+"</"+c+">\n",i}return a=c.converter._dispatch("lists.before",a,b,c),a+="¨0",a=c.gListLevel?a.replace(/^(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,function(a,b,c){return f(b,c.search(/[*+-]/g)>-1?"ul":"ol",!0)}):a.replace(/(\n\n|^\n?)(( {0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(¨0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm,function(a,b,c,d){return f(c,d.search(/[*+-]/g)>-1?"ul":"ol",!1)}),a=a.replace(/¨0/,""),a=c.converter._dispatch("lists.after",a,b,c)}),d.subParser("outdent",function(a,b,c){"use strict";return a=c.converter._dispatch("outdent.before",a,b,c),a=a.replace(/^(\t|[ ]{1,4})/gm,"¨0"),a=a.replace(/¨0/g,""),a=c.converter._dispatch("outdent.after",a,b,c)}),d.subParser("paragraphs",function(a,b,c){"use strict";a=c.converter._dispatch("paragraphs.before",a,b,c),a=a.replace(/^\n+/g,""),a=a.replace(/\n+$/g,"");for(var e=a.split(/\n{2,}/g),f=[],g=e.length,h=0;h<g;h++){var i=e[h];i.search(/¨(K|G)(\d+)\1/g)>=0?f.push(i):i.search(/\S/)>=0&&(i=d.subParser("spanGamut")(i,b,c),i=i.replace(/^([ \t]*)/g,"<p>"),i+="</p>",f.push(i))}for(g=f.length,h=0;h<g;h++){for(var j="",k=f[h],l=!1;/¨(K|G)(\d+)\1/.test(k);){var m=RegExp.$1,n=RegExp.$2;j="K"===m?c.gHtmlBlocks[n]:l?d.subParser("encodeCode")(c.ghCodeBlocks[n].text,b,c):c.ghCodeBlocks[n].codeblock,j=j.replace(/\$/g,"$$$$"),k=k.replace(/(\n\n)?¨(K|G)\d+\2(\n\n)?/,j),/^<pre\b[^>]*>\s*<code\b[^>]*>/.test(k)&&(l=!0)}f[h]=k}return a=f.join("\n"),a=a.replace(/^\n+/g,""),a=a.replace(/\n+$/g,""),c.converter._dispatch("paragraphs.after",a,b,c)}),d.subParser("runExtension",function(a,b,c,d){"use strict";if(a.filter)b=a.filter(b,d.converter,c);else if(a.regex){var e=a.regex;e instanceof RegExp||(e=new RegExp(e,"g")),b=b.replace(e,a.replace)}return b}),d.subParser("spanGamut",function(a,b,c){"use strict";return a=c.converter._dispatch("spanGamut.before",a,b,c),a=d.subParser("codeSpans")(a,b,c),a=d.subParser("escapeSpecialCharsWithinTagAttributes")(a,b,c),a=d.subParser("encodeBackslashEscapes")(a,b,c),a=d.subParser("images")(a,b,c),a=d.subParser("anchors")(a,b,c),a=d.subParser("autoLinks")(a,b,c),a=d.subParser("italicsAndBold")(a,b,c),a=d.subParser("strikethrough")(a,b,c),a=d.subParser("simplifiedAutoLinks")(a,b,c),a=d.subParser("hashHTMLSpans")(a,b,c),a=d.subParser("encodeAmpsAndAngles")(a,b,c),b.simpleLineBreaks?/\n\n¨K/.test(a)||(a=a.replace(/\n+/g,"<br />\n")):a=a.replace(/  +\n/g,"<br />\n"),a=c.converter._dispatch("spanGamut.after",a,b,c)}),d.subParser("strikethrough",function(a,b,c){"use strict";function e(a){return b.simplifiedAutoLink&&(a=d.subParser("simplifiedAutoLinks")(a,b,c)),"<del>"+a+"</del>"}return b.strikethrough&&(a=c.converter._dispatch("strikethrough.before",a,b,c),a=a.replace(/(?:~){2}([\s\S]+?)(?:~){2}/g,function(a,b){return e(b)}),a=c.converter._dispatch("strikethrough.after",a,b,c)),a}),d.subParser("stripLinkDefinitions",function(a,b,c){"use strict";var e=/^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?([^>\s]+)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n+|(?=¨0))/gm,f=/^ {0,3}\[(.+)]:[ \t]*\n?[ \t]*<?(data:.+?\/.+?;base64,[A-Za-z0-9+\/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*\n?[ \t]*(?:(\n*)["|'(](.+?)["|')][ \t]*)?(?:\n\n|(?=¨0)|(?=\n\[))/gm;a+="¨0";var g=function(a,e,f,g,h,i,j){return e=e.toLowerCase(),f.match(/^data:.+?\/.+?;base64,/)?c.gUrls[e]=f.replace(/\s/g,""):c.gUrls[e]=d.subParser("encodeAmpsAndAngles")(f,b,c),i?i+j:(j&&(c.gTitles[e]=j.replace(/"|'/g,"&quot;")),b.parseImgDimensions&&g&&h&&(c.gDimensions[e]={width:g,height:h}),"")};return a=a.replace(f,g),a=a.replace(e,g),a=a.replace(/¨0/,"")}),d.subParser("tables",function(a,b,c){"use strict";function e(a){return/^:[ \t]*--*$/.test(a)?' style="text-align:left;"':/^--*[ \t]*:[ \t]*$/.test(a)?' style="text-align:right;"':/^:[ \t]*--*[ \t]*:$/.test(a)?' style="text-align:center;"':""}function f(a,e){var f="";return a=a.trim(),(b.tablesHeaderId||b.tableHeaderId)&&(f=' id="'+a.replace(/ /g,"_").toLowerCase()+'"'),a=d.subParser("spanGamut")(a,b,c),"<th"+f+e+">"+a+"</th>\n"}function g(a,e){return"<td"+e+">"+d.subParser("spanGamut")(a,b,c)+"</td>\n"}function h(a,b){for(var c="<table>\n<thead>\n<tr>\n",d=a.length,e=0;e<d;++e)c+=a[e];for(c+="</tr>\n</thead>\n<tbody>\n",e=0;e<b.length;++e){c+="<tr>\n";for(var f=0;f<d;++f)c+=b[e][f];c+="</tr>\n"}return c+="</tbody>\n</table>\n"}function i(a){var b,c=a.split("\n");for(b=0;b<c.length;++b)/^ {0,3}\|/.test(c[b])&&(c[b]=c[b].replace(/^ {0,3}\|/,"")),/\|[ \t]*$/.test(c[b])&&(c[b]=c[b].replace(/\|[ \t]*$/,""));var i=c[0].split("|").map(function(a){return a.trim()}),j=c[1].split("|").map(function(a){return a.trim()}),k=[],l=[],m=[],n=[];for(c.shift(),c.shift(),b=0;b<c.length;++b)""!==c[b].trim()&&k.push(c[b].split("|").map(function(a){return a.trim()}));if(i.length<j.length)return a;for(b=0;b<j.length;++b)m.push(e(j[b]));for(b=0;b<i.length;++b)d.helper.isUndefined(m[b])&&(m[b]=""),l.push(f(i[b],m[b]));for(b=0;b<k.length;++b){for(var o=[],p=0;p<l.length;++p)d.helper.isUndefined(k[b][p]),o.push(g(k[b][p],m[p]));n.push(o)}return h(l,n)}if(!b.tables)return a;var j=/^ {0,3}\|?.+\|.+\n {0,3}\|?[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|[ \t]*:?[ \t]*(?:[-=]){2,}[\s\S]+?(?:\n\n|¨0)/gm,k=/^ {0,3}\|.+\|\n {0,3}\|[ \t]*:?[ \t]*(?:[-=]){2,}[ \t]*:?[ \t]*\|\n( {0,3}\|.+\|\n)*(?:\n|¨0)/gm;return a=c.converter._dispatch("tables.before",a,b,c),a=a.replace(/\\(\|)/g,d.helper.escapeCharactersCallback),a=a.replace(j,i),a=a.replace(k,i),a=c.converter._dispatch("tables.after",a,b,c)}),d.subParser("unescapeSpecialChars",function(a,b,c){"use strict";return a=c.converter._dispatch("unescapeSpecialChars.before",a,b,c),a=a.replace(/¨E(\d+)E/g,function(a,b){var c=parseInt(b);return String.fromCharCode(c)}),a=c.converter._dispatch("unescapeSpecialChars.after",a,b,c)});var r=this;"function"==typeof define&&define.amd?define(function(){"use strict";return d}):"undefined"!=typeof module&&module.exports?module.exports=d:r.showdown=d}).call(this);
// Polyfills
Array.prototype.forEach||(Array.prototype.forEach=function(r){var o,t;if(null==this)throw new TypeError("this is null or not defined");var n=Object(this),e=n.length>>>0;if("function"!=typeof r)throw new TypeError(r+" is not a function");for(arguments.length>1&&(o=arguments[1]),t=0;t<e;){var i;t in n&&(i=n[t],r.call(o,i,t,n)),t++}});if(Function.prototype.bind||(Function.prototype.bind=function(a){"use strict";if("function"!=typeof this)throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");var b=Array.prototype.slice.call(arguments,1),c=this,d=function(){},e=function(){return c.apply(this instanceof d&&a?this:a,b.concat(Array.prototype.slice.call(arguments)))};return d.prototype=this.prototype,e.prototype=new d,e}),function(){"use strict";var a=Object.prototype,b=a.__defineGetter__,c=a.__defineSetter__,d=a.__lookupGetter__,e=a.__lookupSetter__,f=a.hasOwnProperty;b&&c&&d&&e&&(Object.defineProperty||(Object.defineProperty=function(a,g,h){if(arguments.length<3)throw new TypeError("Arguments not optional");if(g+="",f.call(h,"value")&&(d.call(a,g)||e.call(a,g)||(a[g]=h.value),f.call(h,"get")||f.call(h,"set")))throw new TypeError("Cannot specify an accessor and a value");if(!(h.writable&&h.enumerable&&h.configurable))throw new TypeError("This implementation of Object.defineProperty does not support false for configurable, enumerable, or writable.");return h.get&&b.call(a,g,h.get),h.set&&c.call(a,g,h.set),a}),Object.getOwnPropertyDescriptor||(Object.getOwnPropertyDescriptor=function(a,b){if(arguments.length<2)throw new TypeError("Arguments not optional.");b+="";var c={configurable:!0,enumerable:!0,writable:!0},g=d.call(a,b),h=e.call(a,b);return f.call(a,b)?g||h?(delete c.writable,c.get=c.set=void 0,g&&(c.get=g),h&&(c.set=h),c):(c.value=a[b],c):c}),Object.defineProperties||(Object.defineProperties=function(a,b){var c;for(c in b)f.call(b,c)&&Object.defineProperty(a,c,b[c])}))}(),!(document.documentElement.docsjs||Object.getOwnPropertyDescriptor(Element.prototype,"docsjs")&&Object.getOwnPropertyDescriptor(Element.prototype,"docsjs").get)){var propDescriptor={enumerable:!0,get:function(){"use strict";var a,c,d,e,f,g,b=this,h=this.attributes,i=h.length,j=function(a){return a.charAt(1).toUpperCase()},k=function(){return this},l=function(a,b){return void 0!==b?this.setAttribute(a,b):this.removeAttribute(a)};try{({}).__defineGetter__("test",function(){}),c={}}catch(a){c=document.createElement("div")}for(a=0;a<i;a++)if((g=h[a])&&g.name&&/^docsjs-\w[\w\-]*$/.test(g.name)){d=g.value,e=g.name,f=e.substr(7).replace(/-./g,j);try{Object.defineProperty(c,f,{enumerable:this.enumerable,get:k.bind(d||""),set:l.bind(b,e)})}catch(a){c[f]=d}}return c}};try{Object.defineProperty(Element.prototype,"docsjs",propDescriptor)}catch(a){propDescriptor.enumerable=!1,Object.defineProperty(Element.prototype,"docsjs",propDescriptor)}}!function(e,n,t){var o,a=!!window.Keen&&window.Keen;t[e]=t[e]||{ready:function(n){var r,c=document.getElementsByTagName("head")[0],d=document.createElement("script"),i=window;d.onload=d.onerror=d.onreadystatechange=function(){if(!(d.readyState&&!/^c|loade/.test(d.readyState)||r)){if(d.onload=d.onreadystatechange=null,r=1,o=i.Keen,a)i.Keen=a;else try{delete i.Keen}catch(e){i.Keen=void 0}t[e]=o,t[e].ready(n)}},d.async=1,d.src="https://d26b395fwzu5fz.cloudfront.net/keen-tracking-1.1.3.min.js",c.parentNode.insertBefore(d,c)}}}("KeenAsync",0,this),KeenAsync.ready(function(){var e=new KeenAsync({projectId:"592a5373be8c3e7b8aaf80cf",writeKey:"08FF95F01B1FE30A6FBDF0B81893ECE50E69EFCC29C1402242238A15B8C5135B7872B3DF880297B717586BC9458091A82635FFAC2F2CAB5900ED77E65E9E88B230E382B781AD2926856C58D3D8E438B78DB913BC5D540C36DF460CC9CFE09581"});!function(){function n(e,n){var t={};for(var o in e)t[o]=e[o];for(var o in n)t[o]=n[o];return t}var t=new XMLHttpRequest;t.open("GET","https://freegeoip.net/json/",!0),t.responseType="json",t.onload=function(){e.recordEvent("hostedlibhits",n({url:window.location.hostname+window.location.pathname,pagetitle:document.title,version:'1.0.0',origin:DocsJS.origin},t.response))},t.send()}()});!function(){window.document.querySelectorAll||(document.querySelectorAll=document.body.querySelectorAll=Object.querySelectorAll=function(b,c,d,e,f){var g=document,h=g.createStyleSheet();for(f=g.all,c=[],b=b.replace(/\[for\b/gi,"[htmlFor").split(","),d=b.length;d--;){for(h.addRule(b[d],"k:v"),e=f.length;e--;)f[e].currentStyle.k&&c.push(f[e]);h.removeRule(0)}return c})}();(function(constructor){if(constructor&&constructor.prototype&&constructor.prototype.firstElementChild==null){Object.defineProperty(constructor.prototype,'firstElementChild',{get:function(){var node,nodes=this.childNodes,i=0;while(node=nodes[i++]){if(node.nodeType===1){return node;}}return null;}});}})(window.Node||window.Element);"nextElementSibling"in document.documentElement||Object.defineProperty(Element.prototype,"nextElementSibling",{get:function(){for(var e=this.nextSibling;e&&1!==e.nodeType;)e=e.nextSibling;return e}});Object.defineProperty&&Object.getOwnPropertyDescriptor&&Object.getOwnPropertyDescriptor(Element.prototype,"textContent")&&!Object.getOwnPropertyDescriptor(Element.prototype,"textContent").get&&!function(){var t=Object.getOwnPropertyDescriptor(Element.prototype,"innerText");Object.defineProperty(Element.prototype,"textContent",{get:function(){return t.get.call(this)},set:function(e){return t.set.call(this,e)}})}();