<?php

date_default_timezone_set('Europe/Amsterdam');


function generate($n)
{
	$vars = [];
	for ($i = 1; $i < $n; ++$i)
	{
		$vars[]  = array_filter([$n - $i, $i]);
		if ($i > 1)
		{
			$generate = generate($i);
			foreach ($generate as $combine)
				$vars[] = array_merge([$n - $i], $combine);
		}
	}

	return $vars;
}

$cols   = +$argv[1];
$combo  = generate($cols);
$tokens = [];

foreach ($combo as $token)
	$tokens[join('-', $token)] = true;

ksort($tokens, SORT_NUMERIC);

$rules = [];

//  generate stylesheet
for ($i = 0; $i < $cols; ++$i)
{
	for ($j = 2; $j <= $cols; ++$j)
	{
		$pattern = '/^' . join('-', $i > 0 ? array_fill(0, $i, '[0-9]+') : []) . ($i > 0 ? '-' : '') . $j . '\b/';
		foreach ($tokens as $selector=>$void)
			if (preg_match($pattern, $selector, $match))
			{
				$rule   = '{' . PHP_EOL . "\t" . 'width: calc(var(--column-width) * ' . $j . ');' . PHP_EOL . '}' . PHP_EOL;
				$select = explode('-', $selector);

				if (!isset($rules[$rule]))
					$rules[$rule] = [];
				if (!isset($rules[$rule][$i + 1]))
					$rules[$rule][$i + 1] = [];

				$rules[$rule][$i + 1]['.grid--' . $selector . ' > :nth-child(' . count($select) . 'n+' . ($i + 1) . ')'] = true;
			}
	}
}

function cmp($a, $b)
{
	if (strlen($a) == strlen($b))
		return 0;
	if (strlen($a) > strlen($b))
		return 1;
	return -1;
}


print '/*!  Pillar v0.1  -  Grid system (' . $cols . ' columns)
Copyright ⓒ ' . date(Y) . ' Konfirm. All rights reserved
Licensed under the MIT License.
*//*
	Inspired by the awesome Pure CSS framework (http://purecss.io)
*/

:root {
	--column-count: ' . $cols . ';
	--column-width: calc(100% / var(--column-count));
}

/*  The default \'column\' width and display mode  */
[class *= "grid"] > * {
	display: inline-block;
    *display: inline; /*  IE < 8: fake inline-block  */
    zoom: 1;
	width: calc(var(--column-width) * 1);
}
/*  The \'row\' will be using the flex display mode  */
[class *= "grid"] {
	display: flex;
	flex-flow: row wrap;
    text-rendering: optimizespeed; /* Webkit: fixes text-rendering: optimizeLegibility */
}

';


foreach ($rules as $rule=>$selector)
{
	ksort($selector, SORT_NUMERIC);
	$merge = [];
	$max   = 0;
	foreach ($selector as $col=>$values)
	{
		uksort($values, 'cmp');
		foreach ($values as $select=>$void)
		{
			$max = max($max, strlen($select));
			$merge[] = $select;
		}
	}

	$pad = str_pad('', $max, ' ');
	for ($i = 0; $i < count($merge); ++$i)
		$merge[$i] = str_replace('>', substr($pad, 0, $max - strlen($merge[$i])) . '>', $merge[$i]);

	print join(',' . PHP_EOL, $merge) . $rule . PHP_EOL;
}
