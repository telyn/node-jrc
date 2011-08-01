BUILD_HTMLS=
USER_HTMLS=
API_HTMLS=requirements.html
PROTOCOL_HTMLS=

DOCTYPES= html man pdf

BUILD_PDFS=
USER_PDFS=
API_PDFS=requirements.pdf
PROTOCOL_PDFS=

HTMLS=$(BUILD_HTMLS) $(USER_HTMLS) $(API_HTMLS) $(PROTOCOL_HTMLS) 
PDFS=$(BUILD_PDFS) $(USER_PDFS) $(API_PDFS) $(PROTOCOL_PDFS) 


MARKDOWN = markdown
WKHTMLTOPDF = wkhtmltopdf

.PHONY: html pdf man docs clean

docs: $(DOCTYPES)


html: $(HTMLS)
	mkdir -p html
	cp *.html html

man:
	mkdir -p man

pdf: html $(PDFS) 
	mkdir -p pdf
	cp *.pdf pdf
	rm *.pdf *.html
	
clean:
	rm *.pdf *.html
	rm -r $(DOCTYPES)

%.html : %.mkd
	markdown $< > $@
#	cat header.html $@ footer.html > $@

%.pdf: %.html
	wkhtmltopdf page $< $@
