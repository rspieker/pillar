#  Run all tests
all:
	@$(MAKE) sources myth default;

dist:
	@$(MAKE) myth default;

sources:
	@mkdir -p src && for PILLARS in $$(seq 3 7); do MYTH=off MIN=off node pillar.js $$PILLARS > src/pillar-$$PILLARS-v$$(grep version package.json | cut -d\: -f2 | cut -d\" -f2).myth.css; done;

myth:
	@mkdir -p dist && for PILLARS in $$(seq 3 7); do MIN=off node pillar.js $$PILLARS > dist/pillar-$$PILLARS-v$$(grep version package.json | cut -d\: -f2 | cut -d\" -f2).css; done;

default:
	@mkdir -p dist && for PILLARS in $$(seq 3 7); do node pillar.js $$PILLARS > dist/pillar-$$PILLARS-v$$(grep version package.json | cut -d\: -f2 | cut -d\" -f2).min.css; done;

#  Check all sources for a 'todo' and display those
todo:
	@grep -ir --exclude-dir=node_modules --exclude-dir=report --exclude="*.html" todo * | cut -d: -f2- | tr "\t\/" " " | sed 's/^ *//';

#  Generate the list of authors with the number of occurences in the git log (representing the amount of commits)
commit-count:
	@git log --format='%aN <%aE>' | sort | uniq -c | sort -r;

#  The list of authors, with the commit-count itself removed
credits:
	@$(MAKE) commit-count | sed 's/^ *[0-9]* //';

#  Update the AUTHORS file
authors-file:
	@$(MAKE) credits > AUTHORS;
