# DocsJS 1.2.3
[![Latest NPM release](https://img.shields.io/npm/v/docsjs.svg?style=flat-square)](https://www.npmjs.com/package/docsjs)
[![NPM downloads per month](https://img.shields.io/npm/dm/docsjs.svg?style=flat-square)](https://www.npmjs.com/package/docsjs)
[![jsDelivr downloads per month](https://data.jsdelivr.com/v1/package/npm/docsjs/badge)](https://www.jsdelivr.com/package/npm/docsjs)
[![License](https://img.shields.io/npm/l/docsjs.svg?style=flat-square)](./LICENSE)

See how to use DocsJS at [hailiax.io/docsjs/](https://hailiax.io/docsjs/).  
That site is also an example: it's a doc for DocsJS built with DocsJS containing live DocsJS examples. Doception!

## Basic usage (HTML)
Add this to your `<head>`.
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/docsjs@1/src/docs.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/docsjs@1/src/themes/Minimal.min.css" rel="stylesheet" id="DocsJS-theme">
```
Add this to your `<body>`.
```html
<docs-js sidebars="menu choice">
	<s-c>
		<h-d>
			<t-l>Section header</t-l>
			<t-x>Header content</t-x>
		</h-d>
		<t-p>
			<t-l>Topic</t-l>
			<t-x>Learn more at hailiax.io/docsjs/</t-x>
			<e-g>Example</e-g>
			<e-x>More</e-x>
		</t-p>
	</s-c>
</docs-js>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/docsjs@1/src/ace/ace.js"></script>
<script>DocsJS.init();</script>
```
## Basic usage (Markdown)
Add this to your `<head>`.
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/docsjs@1/src/docs.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/docsjs@1/src/themes/Minimal.min.css" rel="stylesheet" id="DocsJS-theme">
```
Add this to your `<body>`.
```markdown
<docs-js mode="markdown" sidebars="none menu"><!--

# Example markdown
DocsJS converts Markdown to custom tags and then handles the doc the same way it handles custom tag docs.

## Example topic
Bullet points  
*  Hello
*  World  

## Example code
Below you'll see some syntax-highlighted block code:
    ```javascript
    var s = "JavaScript syntax highlighting";
    alert(s);
    ```
Here is `some inline code`.

--></docs-js>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/docsjs@1/src/ace/ace.js"></script>
<script>DocsJS.init();</script>
```

## Full changelog
### 1.2.3 // 2 Oct 2017
*  Publish to NPM
### 1.2.0 // A mark up // 1 Oct 2017
*  Support for markdown
*  Sidebars improved
*  Redeisgned minimal theme now default
*  All known bugs fixed
### 1.1.0 // Sidebars // 26 Sep 2017
*  UI for sidebars redesigned
*  Massive overhaul to scrolling performance
*  Bug fixes
### 1.0.3 // 24 Sep 2017
*  Bug fixes. DocsJS ready for public release!
### 1.0.2 // 24 Sep 2017
*  DocsJS.jumpTo() replaced with DocsJS.scroll()
### 1.0.1 // 23 Sep 2017
*  Bug fixes.
### 1.0.0 // Initial // 17 Sep 2017
*  DocsJS Released!

## Note
docs.js is not commented out well and the code could use some cleaning. I'll probably clean up the code in the next update.