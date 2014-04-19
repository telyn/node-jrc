jades := $(wildcard *.jade)
docbooks := $(jades:%.jade=%.docbook)

all: $(docbooks)

%.docbook: %.jade
	../node_modules/.bin/jade -P $<
	mv $(@:%.docbook=%.html) $@