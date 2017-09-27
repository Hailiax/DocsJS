// JavaScript Document
var windowScalarTimer, fullWidth, parse, scaleWindow;
if (false){var DocsJS;}
function init(){
	'use strict';
	
	/* Set random background
	DocsJS.apply(function(doc){
		doc.querySelector('[docsjs-tag="bg"]').setAttribute('style','background-image:url(example/backgrounds/'+Math.round(Math.random()*20)+'.jpg);');
	});*/
	
	// If screen is too small, remove header examples
	if (DocsJS.window.width() < 500){
		document.getElementById('JN').style.display = 'none';
		document.getElementById('SS').style.display = 'none';
		document.getElementById('ST').style.display = 'none';
	}
	
	// Set up examples where the user edits code to an iframe
	parse = function(el){
		var html = '<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Example</title><script src="'+DocsJS.origin+'"></script><link href="'+DocsJS.origin.split('/').splice(0,DocsJS.origin.split('/').length-1).join('/')+'/themes/Hailaxian.min.css'+'" rel="stylesheet" id="DocsJS-theme"></head><body>'+DocsJS.cd.getEditor(el).getValue().replace(/\n/g,'%0A').replace(/\t/g,'&#9')+'<script src="'+DocsJS.origin.split('/').splice(0,DocsJS.origin.split('/').length-1).join('/')+'/ace/ace.js'+'"></script><script>DocsJS.hashchanged=function(){};DocsJS.init();</script></body></html>';
		document.getElementsByClassName(el.className.split(' ')[0]+' dest')[0].src = 'data:text/html,'+html;
	};
	var bindParse = function(){
		DocsJS.forEach(document.querySelectorAll('.parse'),function(el){
			var timeout;
			DocsJS.addEvent(el, 'keydown', function(){
				clearTimeout(timeout);
				document.getElementsByClassName(el.className.split(' ')[0]+' dest')[0].src = '';
				window.setTimeout(function(){
					timeout = window.setTimeout(function(){parse(el);},100);
				},0);
			});
			DocsJS.addEvent(el, 'keyup', function(){
				timeout = window.setTimeout(function(){parse(el);},100);
			});
			parse(el);
		});
	};
	DocsJS.events.cdRefreshed = bindParse;
	bindParse();
	
	// Update custom body
	var updateCustomHead = function(){
		var editor = DocsJS.cd.getEditor(document.getElementById('customizeResultHead'));
		editor.setValue('<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/Hailiax/DocsJS@1/src/docs.min.js"></script>\n'+(DocsJS.theme === null?'<style>\n\t'+DocsJS.cd.getEditor(document.getElementById('customTheme')).getValue().replace(/\n/g,'')+'\n</style>':'<link href="https://cdn.jsdelivr.net/gh/Hailiax/DocsJS@1/src/themes/'+DocsJS.theme+'.min.css" rel="stylesheet" id="DocsJS-theme">'));
		DocsJS.cd.refresh();
	};
	var updateCustomBody = function(){
		var packages = '';
		DocsJS.forEach(document.querySelectorAll('input[name="IncludedPackages"]'),function(el){
			if (el.checked){
				switch (el.value){
					case 'ace':
						packages += '<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/Hailiax/DocsJS@1/src/ace/ace.js"></script>\n';
						break;
					case 'mathjax':
						packages += '<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-AMS_CHTML"></script>\n';
						break;
				}
			}
		});
		var newBody = '<div docsjs-tag="DocsJS-This-Baby">\n\t<!-- This is where you write your doc -->\n</div>\n'+packages+'<script>\n';
		if (DocsJS.cd.theme !== DocsJS.aceTheme[DocsJS.theme]){
			newBody += '\tDocsJS.cd.theme = \''+DocsJS.cd.theme+'\';\n';
		}
		DocsJS.forEach(document.getElementById('jsOptions').querySelectorAll('input,select'),function(el){
			if (el.value !== ''){
				switch (el.name){
					case 'fontsize':
						newBody += '\tDocsJS.fontsize.set('+el.value+');\n';
						DocsJS.fontsize.set(parseFloat(el.value));
						break;
					case 'width.max':
						newBody += '\tDocsJS.width.max = '+el.value+';\n';
						DocsJS.width.max = parseFloat(el.value);
						break;
					case 'width.min':
						newBody += '\tDocsJS.width.min = '+el.value+';\n';
						DocsJS.width.min = parseFloat(el.value);
						break;
					case 'animation.duration':
						newBody += '\tDocsJS.animation.duration = '+el.value+';\n';
						DocsJS.animation.duration = parseFloat(el.value);
						break;
					case 'menu.top':
						newBody += '\tDocsJS.menu.top = \''+el.value+'\';\n';
						DocsJS.forEach(document.querySelectorAll('[docsjs-tag="menu-title"][docsjs-menu-location="'+DocsJS.menu.top+'"]'),function(mn){
							mn.docsjs.menuLocation = el.value;
							mn.removeAttribute('onclick');
							mn.setAttribute('onclick',"DocsJS._menuClicked(this,'"+el.value+"');");
							mn.docsjs.menuDestination = el.value;
							mn.innerHTML = el.value;
						});
						DocsJS.menu.top = el.value;
						break;
					case 'menu.bottom':
						newBody += '\tDocsJS.menu.bottom = \''+el.value+'\';\n';
						DocsJS.forEach(document.querySelectorAll('[docsjs-tag="menu-title"][docsjs-menu-location="'+DocsJS.menu.bottom+'"]'),function(mn){
							mn.docsjs.menuLocation = el.value;
							mn.removeAttribute('onclick');
							mn.setAttribute('onclick',"DocsJS._menuClicked(this,'"+el.value+"');");
							mn.docsjs.menuDestination = el.value;
							mn.innerHTML = el.value;
						});
						DocsJS.menu.bottom = el.value;
						break;
					case 'cd.editable':
						if (el.value !== 'false'){
							newBody += '\tDocsJS.cd.editable = '+el.value+';\n';
						}
						DocsJS.cd.editable = JSON.parse(el.value);
						break;
					case 'eg.name':
						newBody += '\tDocsJS.eg.name = \''+el.value+'\';\n';
						DocsJS.eg.name = el.value;
						DocsJS.forEach(document.querySelectorAll('e-g'),function(e){
							if (e.docsjs.name === undefined){
								e = e.previousSibling;
								e.innerHTML = e.firstChild.outerHTML + el.value;
							}
						});
						break;
					case 'ex.name':
						newBody += '\tDocsJS.ex.name = \''+el.value+'\';\n';
						DocsJS.ex.name = el.value;
						DocsJS.forEach(document.querySelectorAll('e-x'),function(e){
							if (e.docsjs.name === undefined){
								e = e.previousSibling;
								e.innerHTML = e.firstChild.outerHTML + el.value;
							}
						});
						break;
					case 'eg.def':
						if (el.value !== 'min'){
							newBody += '\tDocsJS.eg.defaultState = \''+el.value+'\';\n';
						}
						DocsJS.eg.defaultState = el.value;
						break;
					case 'ex.def':
						if (el.value !== 'min'){
							newBody += '\tDocsJS.ex.defaultState = \''+el.value+'\';\n';
						}
						DocsJS.ex.defaultState = el.value;
						break;
				}
			} else{
				switch (el.name){
					case 'fontsize':
						DocsJS.fontsize.set(parseFloat(el.placeholder));
						break;
					case 'width.max':
						DocsJS.width.max = parseFloat(el.placeholder);
						break;
					case 'width.min':
						DocsJS.width.min = parseFloat(el.placeholder);
						break;
					case 'animation.duration':
						DocsJS.animation.duration = parseFloat(el.placeholder);
						break;
					case 'menu.top':
						DocsJS.forEach(document.querySelectorAll('[docsjs-tag="menu-title"][docsjs-menu-location="'+DocsJS.menu.top+'"]'),function(mn){
							mn.docsjs.menuLocation = el.placeholder;
							mn.removeAttribute('onclick');
							mn.setAttribute('onclick',"DocsJS._menuClicked(this,'"+el.placeholder+"');");
							mn.docsjs.menuDestination = el.placeholder;
							mn.innerHTML = el.placeholder;
						});
						DocsJS.menu.top = el.placeholder;
						break;
					case 'menu.bottom':
						DocsJS.forEach(document.querySelectorAll('[docsjs-tag="menu-title"][docsjs-menu-location="'+DocsJS.menu.bottom+'"]'),function(mn){
							mn.docsjs.menuLocation = el.placeholder;
							mn.removeAttribute('onclick');
							mn.setAttribute('onclick',"DocsJS._menuClicked(this,'"+el.placeholder+"');");
							mn.docsjs.menuDestination = el.placeholder;
							mn.innerHTML = el.placeholder;
						});
						DocsJS.menu.bottom = el.placeholder;
						break;
					case 'eg.name':
						DocsJS.eg.name = el.placeholder;
						DocsJS.forEach(document.querySelectorAll('e-g'),function(e){
							if (e.docsjs.name === undefined){
								e = e.previousSibling;
								e.innerHTML = e.firstChild.outerHTML + el.placeholder;
							}
						});
						break;
					case 'ex.name':
						DocsJS.ex.name = el.placeholder;
						DocsJS.forEach(document.querySelectorAll('e-x'),function(e){
							if (e.docsjs.name === undefined){
								e = e.previousSibling;
								e.innerHTML = e.firstChild.outerHTML + el.placeholder;
							}
						});
						break;
				}
			}
		});
		newBody += '\tDocsJS.init();\n</script>';
		DocsJS.cd.getEditor(document.getElementById('customizeResultBody')).setValue(newBody);
		DocsJS.cd.refresh();
		DocsJS.resized();
	};
	
	// Setup custom javascript options
	DocsJS.forEach(document.getElementById('jsOptions').querySelectorAll('input,select'),function(el){
		el.onchange = updateCustomBody;
	});
	
	// Set up choose theme
	var chooseTheme = function(){
		document.getElementById('ChooseTheme').querySelector('option[selected="selected"]').removeAttribute('selected');
		var theme = document.getElementById('themeSelect').value;
		DocsJS.theme = theme;
		if (theme === 'Minimal'){
			document.getElementById('logoImage').style.backgroundColor = 'rgba(31,36,41,.95)';
			document.getElementById('logoImage').style.margin = '1em';
		} else{
			document.getElementById('logoImage').style.backgroundColor = '';
			document.getElementById('logoImage').style.margin = '';
		}
		var sheet = DocsJS.origin.split('/');
		sheet.pop();
		sheet = sheet.join('/') + '/themes/' + theme + '.css';
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (this.readyState === 4 && this.status === 200) {
				DocsJS.cd.getEditor(document.getElementById('ChooseTheme').querySelector('c-d')).setValue(xhr.responseText);
			}
			updateCustomHead();
			try{document.getElementsByTagName('head')[0].removeChild(document.getElementById('DocsJS-theme'));}catch(e){}
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
			document.getElementById('ChooseTheme').querySelector('option[value="'+theme+'"]').setAttribute('selected','selected');
			document.getElementById('ChooseTheme').querySelector('select').onchange = chooseTheme;
		};
		xhr.open("GET", sheet, true);
		xhr.send();
	};
	document.getElementById('ChooseTheme').querySelector('select').onchange = chooseTheme;
	document.getElementById('ChooseTheme').querySelector('option[value="Hailaxian"]').setAttribute('selected','selected');
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState === 4 && this.status === 200) {
			DocsJS.cd.getEditor(document.getElementById('ChooseTheme').querySelector('c-d')).setValue(xhr.responseText);
			DocsJS.cd.refresh();
		}
	};
	var sheet = DocsJS.origin.split('/');
	sheet.pop();
	sheet = sheet.join('/') + '/themes/Hailaxian.css';
	xhr.open("GET", sheet, true);
	xhr.send();
	
	// Set up choose ace theme
	document.getElementById('aceThemeSelect').onchange = function(){
		if (this.value === ''){
			DocsJS.cd.theme = undefined;
		} else{
			DocsJS.cd.theme = this.value;
		}
		updateCustomBody();
	};
	
	// Set custom theme
	document.getElementById('ApplyCustTheme').onclick = function(){
		var cT = document.getElementById('customTheme');
		DocsJS.theme = null;
		document.getElementsByTagName('head')[0].removeChild(document.getElementById('DocsJS-theme'));

		var themeSheet = document.createElement('style');
		themeSheet.id = 'DocsJS-theme';
		themeSheet.innerHTML = DocsJS.cd.getEditor(cT).getValue();
		document.getElementsByTagName('head')[0].appendChild(themeSheet);

		updateCustomHead();
	};
	document.getElementById('ResetCustTheme').onclick = chooseTheme;
	
	// Set up choose packages
	DocsJS.forEach(document.querySelectorAll('input[name="IncludedPackages"]'),function(el){
		el.onchange = updateCustomBody;
	});
	
	// Set up shrinking window example
	var correctSidebarsTimeout;
	scaleWindow = function(percent){
		document.querySelector('[docsjs-tag="column-left"]').style.marginLeft = '0';
		document.getElementById('windowScalarPlus').style.color = document.getElementById('windowScalarMinus').style.color = "#000";
		if (percent < 101 && percent/100*fullWidth > 200){
			
			DocsJS.window.width = function(){
				return fullWidth*percent/100;
			};
			document.getElementById('windowScalarPercent').innerHTML = percent + '%';
			document.getElementById('windowScalarPixels').innerHTML = DocsJS.window.width() + 'px Wide';
			DocsJS.cache.initiated = false;
			DocsJS.resized();
			DocsJS.cache.initiated = true;
			clearInterval(correctSidebarsTimeout);
			correctSidebarsTimeout = window.setTimeout(function(){
				DocsJS.resized();
				document.querySelector('[docsjs-tag="'+DocsJS.superparent+'"]').style.width = percent + '%';
				var difference = fullWidth*(100-percent)/200;

				document.querySelector('[docsjs-tag="column-right"]').style.marginLeft = -1*document.querySelector('[docsjs-tag="column-right"]').clientWidth + (document.querySelector('[docsjs-tag="column-right"]').style.position === 'absolute'? difference : -1*difference) + 'px';
				document.querySelector('[docsjs-tag="column-left"]').style.marginLeft = difference + 'px';
				DocsJS.forEach(document.querySelectorAll('main > s-c'),function(el){
					el.style.marginLeft = parseInt(el.style.marginLeft) + difference + 'px';
				});
				document.getElementsByClassName('baseground')[0].style.width = difference + 'px';
				document.getElementsByClassName('baseground')[1].style.width = difference + 'px';
			},1000);
			document.querySelector('[docsjs-tag="'+DocsJS.superparent+'"]').style.width = percent + '%';
			var difference = fullWidth*(100-percent)/200;
			
			document.querySelector('[docsjs-tag="column-right"]').style.marginLeft = -1*document.querySelector('[docsjs-tag="column-right"]').clientWidth + (document.querySelector('[docsjs-tag="column-right"]').style.position === 'absolute'? difference : -1*difference) + 'px';
			document.querySelector('[docsjs-tag="column-left"]').style.marginLeft = difference + 'px';
			DocsJS.forEach(document.querySelectorAll('main > s-c'),function(el){
				el.style.marginLeft = parseInt(el.style.marginLeft) + difference + 'px';
			});
			document.getElementsByClassName('baseground')[0].style.width = difference + 'px';
			document.getElementsByClassName('baseground')[1].style.width = difference + 'px';
			
			window.scroll(0,DocsJS.window.scrollTop()+document.getElementById('windowScalarPlus').getBoundingClientRect().top-DocsJS.fontsize._value*3);
		} else{
			clearInterval(windowScalarTimer);
			if (percent >= 100){
				DocsJS.window.width = function(){
					return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
				};
				document.getElementById('windowScalarPlus').style.color = "#909090";
			} else{
				document.getElementById('windowScalarMinus').style.color = "#909090";
			}
		}
	};
	
	document.getElementById('windowScalarMinus').onmousedown = document.getElementById('windowScalarMinus').ontouchstart = function(){
		clearInterval(windowScalarTimer);
		windowScalarTimer = window.setInterval(function(){
			if (parseInt(document.getElementById('windowScalarPercent').innerHTML) === 100){
				fullWidth = DocsJS.window.width();
			}
			var percent = parseInt(document.getElementById('windowScalarPercent').innerHTML) - 3;
			scaleWindow(percent);
		},15);
	};
	document.getElementById('windowScalarMinus').onmouseup = document.getElementById('windowScalarMinus').onmouseout = document.getElementById('windowScalarMinus').ontouchend = document.getElementById('windowScalarMinus').ontouchcancel = function(){
		clearInterval(windowScalarTimer);
	};
	document.getElementById('windowScalarPlus').onmousedown = document.getElementById('windowScalarPlus').ontouchstart = function(){
		clearInterval(windowScalarTimer);
		windowScalarTimer = window.setInterval(function(){
			if (parseInt(document.getElementById('windowScalarPercent').innerHTML) === 100){
				fullWidth = DocsJS.window.width();
			}
			var percent = parseInt(document.getElementById('windowScalarPercent').innerHTML) + 3;
			scaleWindow(percent);
		},15);
	};
	document.getElementById('windowScalarPlus').onmouseup = document.getElementById('windowScalarPlus').onmouseout = document.getElementById('windowScalarPlus').ontouchend = document.getElementById('windowScalarPlus').ontouchcancel = function(){
		clearInterval(windowScalarTimer);
	};
	
	DocsJS.addEvent(window,'resize',function(){
		DocsJS.window.width = function(){
			return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		};
		document.getElementById('windowScalarPercent').innerHTML = '100%';
		document.getElementById('windowScalarPixels').innerHTML = DocsJS.window.width() + 'px Wide';
		document.querySelector('[docsjs-tag="column-left"]').style.marginLeft = '0';
		document.getElementById('windowScalarPlus').style.color = "#909090";
		document.getElementById('windowScalarMinus').style.color = "#000";
		document.body.style.width = '';
		document.getElementById('baseGround1').style.width = '0px';
		document.getElementById('baseGround2').style.width = '0px';
	});
	
	DocsJS.events.columnResize = function(){
		scaleWindow(parseInt(document.getElementById('windowScalarPercent').innerHTML));
	};
	
	document.getElementById('screenshots').previousSibling.onmouseover = function(){
		document.getElementById('screenshots').previousSibling.onmouseover = function(){};
		document.getElementById('screenshots').innerHTML = '<div><img src="example/screenshots/desktop/1-snowLeopard.jpeg" alt="screenshot"><p>Snow Leopard</p></div><div><img src="example/screenshots/desktop/2-firefox11.jpeg" alt="screenshot"><p>Firefox 11</p></div><div><img src="example/screenshots/desktop/3-chrome15.jpeg" alt="screenshot"><p>Chrome 15</p></div><div><img src="example/screenshots/desktop/4-ie8.jpeg" alt="screenshot"><p>IE 8</p></div><div><img src="example/screenshots/desktop/5-ie9.jpeg" alt="screenshot"><p>IE 9</p></div><div><img src="example/screenshots/desktop/6-ie10.jpeg" alt="screenshot"><p>IE 10</p></div><div><img src="example/screenshots/desktop/7-ie11.jpeg" alt="screenshot"><p>IE 11</p></div><div><img src="example/screenshots/desktop/8-edge.jpeg" alt="screenshot"><p>MS Edge</p></div><div><img src="example/screenshots/desktop/9-yandex14-12.jpeg" alt="screenshot"><p>Yandex 14.12</p></div><div><img src="example/screenshots/desktop/10-firefox54.jpeg" alt="screenshot"><p>Firefox 54</p></div><div><img src="example/screenshots/desktop/11-chrome60.jpeg" alt="screenshot"><p>Chrome 60</p></div><div><img src="example/screenshots/desktop/12-highSierra.jpeg" alt="screenshot"><p>High Sierra</p></div><div><img src="example/screenshots/phone/1-nokiaLumia520.jpeg" alt="screenshot"><p>Lumia 520</p></div><div><img src="example/screenshots/phone/2-galaxyS2.jpeg" alt="screenshot"><p>Galaxy S2</p></div><div><img src="example/screenshots/phone/3-iPhone4.jpeg" alt="screenshot"><p>iPhone 4</p></div><div><img src="example/screenshots/phone/4-iPhone7.jpeg" alt="screenshot"><p>iPhone 7</p></div>';
	};
}
function shrinkScreen_(){
	'use strict';
	fullWidth = DocsJS.window.width();
	scaleWindow(Math.ceil(40000/DocsJS.window.width()));
	window.scrollTo(0,0);
	document.getElementById('SS').innerHTML = 'Revert screen.';
	document.getElementById('SS').style.backgroundColor = '#fff607';
	document.getElementById('SS').href = 'javascript:revertScreen_();';
}
function revertScreen_(){
	'use strict';
	scaleWindow(100);
	DocsJS.resized();
	window.scrollTo(0,0);
	document.getElementById('SS').innerHTML = 'Shrink screen!';
	document.getElementById('SS').style.backgroundColor = '';
	document.getElementById('SS').href = 'javascript:shrinkScreen_();';
}
function changeTheme_(){
	'use strict';
	document.getElementById('ChooseTheme').querySelector('option[value="Hailaxian"]').removeAttribute('selected');
	document.getElementById('ChooseTheme').querySelector('option[value="Minimal"]').setAttribute('selected','selected');
	document.getElementById('themeSelect').value = 'Minimal';
	document.getElementById('ChooseTheme').querySelector('select').onchange();
	document.getElementById('ST').innerHTML = 'Revert theme.';
	//document.getElementById('ST').style.backgroundColor = '#fff607';
	document.getElementById('ST').href = 'javascript:revertTheme_();';
}
function revertTheme_(){
	'use strict';
	document.getElementById('ChooseTheme').querySelector('option[value="Minimal"]').removeAttribute('selected');
	document.getElementById('ChooseTheme').querySelector('option[value="Hailaxian"]').setAttribute('selected','selected');
	document.getElementById('themeSelect').value = 'Hailaxian';
	document.getElementById('ChooseTheme').querySelector('select').onchange();
	document.getElementById('ST').innerHTML = 'Change theme!';
	//document.getElementById('ST').style.backgroundColor = '';
	document.getElementById('ST').href = 'javascript:changeTheme_();';
}