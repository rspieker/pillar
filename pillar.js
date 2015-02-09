function PillarBuilder()
{
	"use strict";
	var pb = this,
		myth = require('myth'),
		minify = require('cssmin'),
		config = require('./package.json'),
		settings = {
			prefix: 'pllr',
			separator: '-',

			myth: true,
			minify: false
		},
		output = process.stdout;


	function init()
	{
		Object.keys(settings).forEach(function(key){
			Object.defineProperty(pb, key, getSetter(key));
		});
	}

	function getSetter(key)
	{
		return {
			get: function(){
				return settings[key];
			},
			set: function(value){
				settings[key] = value;

				if (!(/^[a-z][a-z0-9-]*$/i).test(settings.prefix + settings.separator))
					throw new Error('Invalid value "' + value + '" for ' + key);
			}
		};
	}

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

	function pattern(skip, seek)
	{
		return new RegExp([
			'^',
			(Array.apply(null, new Array(skip)).map(String.prototype.valueOf, '[0-9]+')).join(settings.separator),
			skip > 0 ? settings.separator : '',
			seek,
			'\\b'
		].join(''));
	}

	function mythRule(span)
	{
		return '{\n\twidth: calc(var(--column-width) * ' + span + ');\n}';
	}

	function rules(tokens, columns)
	{
		var result = {},
			divider = settings.separator + settings.separator,
			rx, i, j;

		for (i = 0; i < columns; ++i)
			for (j = 2; j <= columns; ++j)
			{
				rx = pattern(i, j);
				tokens.forEach(function(selector){
					var rule;

					if (rx.test(selector))
					{
						rule = mythRule(j);

						if (!(rule in result))
							result[rule] = {};

						if (!(i + 1 in result[rule]))
							result[rule][i + 1] = {};

						result[rule][i + 1]['.' + settings.prefix + divider + selector + ' > :nth-child(' + selector.split(settings.separator).length + 'n+' + (i + 1) + ')'] = !0;
					}
				});
			}

		return result;
	}

	function compose(rules, columns)
	{
		var year = new Date().getFullYear(),
			buffer = [];

		if (year !== 2015)
			year = '2015-' + year;

		buffer.push(
			'/*!  ' + config.name + ' v' + config.version + '  -  ' + config.description + ' (' + columns + ' pillars/columns)',
			'Copyright ⓒ ' + year + ' ' + config.author + ' (Konfirm). All rights reserved.',
			'Licensed under the MIT License.',
			'*//*',
			'\tInspired by the awesome Pure CSS framework (http://purecss.io)',
			'*/',
			'',
			':root {',
			'	--column-count: ' + columns + ';',
			'	--column-width: calc(100% / var(--column-count));',
			'}',
			'',
			'/*  The default \'column\' width and display mode  */',
			'[class *= "' + settings.prefix + columns + '"] > *,',
			'[class *= "' + settings.prefix + '"] > * {',
			'	display: inline-block;',
			'	*display: inline; /*  IE < 8: fake inline-block  */',
			'	zoom: 1;',
			'	width: calc(var(--column-width) * 1);',
			'}',
			'',
			'/*  The \'row\' will be using the flex display mode  */',
			'[class *= "' + settings.prefix + '"] {',
			'	display: flex;',
			'	flex-flow: row wrap;',
			'	text-rendering: optimizespeed; /* Webkit: fixes text-rendering: optimizeLegibility */',
			'}',
			'',
			'/*  The generated pillars/columns/grid  */',
			''
		);


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

			buffer.push(merge.join(',\n') + ' ' + rule, '', '');
		});

		buffer = buffer.join('\n');

		if (settings.myth)
			buffer = myth(buffer);

		if (settings.minify)
			buffer = minify(buffer);

		output.write(buffer);
	}

	pb.grid = function(columns){
		var selectors = generate(columns).map(function(selector){
				return selector.join(settings.separator);
			});

		compose(rules(selectors, columns), columns);
	};

	init();
}


var builder = new PillarBuilder();

if (process.argv[3])
	builder.prefix = process.argv[3];

if (process.argv[4])
	builder.separator = process.argv[4];

if (process.argv[5] === 'false')
{
	builder.myth   = false;
	builder.minify = false;
}

if (process.argv[6] === 'false')
{
	builder.minify = false;
}

builder.grid(+(process.argv[2] || 6));
