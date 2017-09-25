# DocsJS 1.0.2
See how to use DocsJS at [hailiax.io/docsjs/](https://hailiax.io/docsjs/).<br>
That site is also an example: it's a doc for DocsJS built with DocsJS containing live DocsJS examples. Doception!

## Basic usage
Add this to your document `<head>`.
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/Hailiax/DocsJS@1/src/docs.min.js"></script>
<link href="https://cdn.jsdelivr.net/gh/Hailiax/DocsJS@1/src/themes/Hailaxian.min.css" rel="stylesheet" id="DocsJS-theme">
```
Add this to your document `<body>`.
```html
<div docsjs-tag="DocsJS-This-Baby">
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
</div>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/Hailiax/DocsJS@1/src/ace/ace.js"></script>
<script>DocsJS.init();</script>
```

## Full changelog
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
