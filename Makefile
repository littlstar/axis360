
##
# Current working build directory
#
CWD := $(shell pwd)

##
# Node modules bin directory
#
BIN := node_modules/.bin

##
# Path to `duo' bin file
#
DUO := $(BIN)/duo

##
# CSS source files
#
CSS := *.css

##
# Module source (js, html, json)
#
SRC := $(wildcard *.js)
SRC += $(wildcard projection/*.js)
SRC += $(wildcard geometry/*.js)
SRC += $(wildcard controls/*.js)
SRC += component.json

##
# Main javascript entry
#
MAIN = index.js

##
# Global namespace target
#
GLOBAL_NAMESPACE = Axis

##
# Ensures parent directory is built
#
define BUILD_PARENT_DIRECTORY
	mkdir -p $(dir $@)
endef

##
# Builds everything
#
all: build dist doc

##
# Builds all files
#
build: build/build.js build/build.css

##
# Builds javascript and html templates
#
build/build.js: node_modules $(SRC)
	$(BUILD_PARENT_DIRECTORY)
	$(DUO) -s $(GLOBAL_NAMESPACE) --type js --development < $(MAIN) > $@

##
# Builds CSS source files
#
build/build.css: node_modules $(CSS)
	$(BUILD_PARENT_DIRECTORY)
	cat $(CSS) | $(DUO) --type css > $@

##
# Builds all dist files
#
dist: dist/axis.js dist/axis.css

##
# Builds javascript dist file
#
dist/axis.js: node_modules $(SRC)
	$(BUILD_PARENT_DIRECTORY)
	$(DUO) -C --type js -s $(GLOBAL_NAMESPACE) < $(MAIN) > $@

##
# Builds CSS dist file
#
dist/axis.css: node_modules $(CSS)
	$(BUILD_PARENT_DIRECTORY)
	cat $(CSS) | $(DUO) -C --type css > $@

##
# Builds node modules
#
node_modules: package.json
	npm install

##
# Builds documentation
#
doc: node_modules $(SRC)
	./scripts/generate_documentation.sh $(CWD) public/doc

##
# Cleans all built files
#
.PHONY: clean
clean:
	rm -rf build
	rm -rf components
	rm -rf node_modules

