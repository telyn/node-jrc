
.PHONY: doc docs
.SILENT: help

help:
	echo "To run node-jrc as a server, simply \`node server.js\`"
	echo "If you want to just run through a default make of the documentation for node-jrc, use \`make docs\`"

doc docs: 
	$(MAKE) -C docs
