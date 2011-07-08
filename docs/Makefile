BUILD_DOCUMENTATION :=
USER_DOCUMENTATION := 
API_AND_PROTOCOL_DOCUMENTATION := 

DOCTYPES := html man pdf


MARKDOWN = markdown
WKHTMLTOPDF = wkhtmltopdf

.SILENT : $(DOCTYPES)
.PHONY : docs clean
docs: $(DOCTYPES)


html:
	mkdir html
man:
	mkdir man
pdf: html
	mkdir pdf
	
clean:
	rm *.pdf *.html
	rm -r $(DOCTYPES)

%.html : %.mkd
	markdown $< > $@
#	cat header.html $@ footer.html > $@

%.pdf : %.html
	wkhtmltopdf page $< $@
