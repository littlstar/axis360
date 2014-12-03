
BIN := node_modules/.bin
JS = index.js
CSS = frame.css
TEMPLATE = template.html
C8 = component.json
JS_SRC = $(JS) $(TEMPLATE) $(C8)

build: build/build.js build/build.css

dist: slant-frame.js slant-frame.css

build/build.js: node_modules $(JS_SRC)
	@mkdir -p $(dir $@)
	@$(BIN)/duo --type js --development < index.js > $@

build/build.css: node_modules $(CSS)
	@mkdir -p $(dir $@)
	@$(BIN)/duo --type css < frame.css > $@

slant-frame.js: node_modules $(JS_SRC)
	@$(BIN)/duo --type js --global SlantFrame < index.js > $@

slant-frame.css: node_modules $(CSS)
	@$(BIN)/duo --type css < frame.css > $@

node_modules: package.json
	@npm install
	@touch $@

clean:
	rm -rf build components
	rm -f slant-frame.css slant-frame.js

.PHONY: dist clean
