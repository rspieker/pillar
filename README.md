# pillar
CSS column based grids simplified

## Keeping the grid simply and easy to maintain
Instead of going through lots and lots of classes if the layout needs to be changed even slightly, why not keep indicate the exact layout on the 'row' element?
One good reason not to do this is the vivid amount of classes and CSS one tends to need in order to support that fancy 24-column grid system. Whilst this statement in itself is true, seriously? 24 columns grids? You mean you actually need those 24 columns *all the time*?
Nope, you don't.

There appears to be a better idea, and yes, it even allows for that 24-columns grid, or even 48 columns or pretty much whatever insane amount of columns you've come up with.

Let's start with a basic "6 column"-based grid
```html
<!DOCTYPE html>

<html>
	<head>
		<link rel=stylesheet href=/path/to/6-pillar-0.1.min.css>
	</head>
	<body>

		<div class=grid--1-1-1-1-1-1>
			<div>1</div>
			<div>1</div>
			<div>1</div>
			<div>1</div>
			<div>1</div>
			<div>1</div>
		</div>

		<div class=grid--3-1-2>
			<div>three columns</div>
			<div>one column</div>
			<div>two columns</div>
		</div>

	</body>
</html>
```
