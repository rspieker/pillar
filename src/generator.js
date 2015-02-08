function generate(n)
{
	var result = [],
		i, j;

	for (i = 1; i < n; ++i)
	{
		result.push([n - i, i]);
		generate(i).forEach(function(combine){
			result.push([n - i].concat(combine));
		});
	}

	return result;
}

var cols = +process.argv[2],
	combo = {},
	rules = {},
	i, j;

generate(cols).forEach(function(token){
	combo[token.join('-')] = !0;
});

for (i = 0; i < cols; ++i)
{
	for (j = 2; j <= cols; ++j)
	{
		var pattern = new RegExp('^' + (Array.apply(null, new Array(i)).map(String.prototype.valueOf, '[0-9]+')).join('-') + (i > 0 ? '-' : '') + j + '\\b');
		Object.keys(combo).forEach(function(selector){
			var rule, select;

			if (pattern.test(selector))
			{
				rule   = '{\n\twidth: calc(var(--column-width) * ' + j + ');\n}';
				select = selector.split('-');

				if (!(rule in rules))
					rules[rule] = {};
				if (!(i + 1 in rules[rule]))
					rules[rule][i + 1] = {};

				rules[rule][i + 1]['.grid--' + selector + ' > :nth-child(' + select.length + 'n+' + (i + 1) + ')'] = !0;
			}
		});
	}
}

process.stdout.write([
	'/*!  Pillar v0.1  -  Grid system (' + cols + ' columns)',
	'Copyright ⓒ ' + (new Date().getFullYear()) + ' Konfirm. All rights reserved.',
	'Licensed under the MIT License.',
	'*//*',
	'\tInspired by the awesome Pure CSS framework (http://purecss.io)',
	'*/',
	'',
	':root {',
	'	--column-count: ' + cols + ';',
	'	--column-width: calc(100% / var(--column-count));',
	'}',
	'',
	'/*  The default \'column\' width and display mode  */',
	'[class *= "grid"] > * {',
	'	display: inline-block;',
	'	*display: inline; /*  IE < 8: fake inline-block  */',
	'	zoom: 1;',
	'	width: calc(var(--column-width) * 1);',
	'}',
	'',
	'/*  The \'row\' will be using the flex display mode  */',
	'[class *= "grid"] {',
	'	display: flex;',
	'	flex-flow: row wrap;',
	'	text-rendering: optimizespeed; /* Webkit: fixes text-rendering: optimizeLegibility */',
	'}',
	'',
	'/*  The generated columns/grid  */',
	''
].join('\n'));


Object.keys(rules).forEach(function(rule){
	var merge = [],
		max = 0;

	Object.keys(rules[rule]).forEach(function(key){
		Object.keys(rules[rule][key]).forEach(function(key){
			max = Math.max(max, key.length);
			merge.push(key);
		});
	});

	merge = merge
		.map(function(key){
			return key.replace('>', new Array(max).join(' ').substr(0, max - key.length) + '>');
		});

	process.stdout.write(merge.join(',\n') + ' ' + rule + '\n\n');
});
