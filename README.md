# DocsJS V1.0.1
See how to use DocsJS at [hailiax.io/docsjs](https://hailiax.io/docsjs)

## Basic usage
Add this to your document <head>.
``html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/Hailiax/DocsJS@1/src/docs.min.js"></script>
<link href="https://cdn.jsdelivr.net/gh/Hailiax/DocsJS@1/src/themes/Hailaxian.min.css" rel="stylesheet" id="DocsJS-theme">
``
Add this to your document <body>.
``html
<div docsjs-tag="DocsJS-This-Baby">
<!-- This is where you write your doc -->
</div>
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/Hailiax/DocsJS@1/src/ace/ace.js"></script>
<script>DocsJS.init();</script>
``


## Note
docs.js is not commented out well and the code could use some cleaning. I'll probably clean up the code in the next update.
