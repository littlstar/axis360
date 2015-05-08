
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
CSS := src/*.css

##
# Module source (js, html, json)
#
SRC := src/*.js src/*.html component.json

##
# Main javascript entry
#
MAIN = src/index.js

##
# Global namespace target
#
GLOBAL_NAMESPACE = SlantFrame

##
# Ensures parent directory is built
#
define BUILD_PARENT_DIRECTORY
	mkdir -p $(dir $@)
endef

##
# Builds everything
#
all: build dist

##
# Builds all files
#
build: build/build.js build/build.css

##
# Builds javascript and html templates
#
build/build.js: node_modules $(SRC)
	$(BUILD_PARENT_DIRECTORY)
	$(DUO) -C --type js --development < $(MAIN) > $@

##
# Builds CSS source files
#
build/build.css: node_modules $(CSS)
	$(BUILD_PARENT_DIRECTORY)
	cat $(CSS) | $(DUO) -C --type css > $@

##
# Builds all dist files
#
dist: dist/slant-frame.js dist/slant-frame.css

##
# Builds javascript dist file
#
dist/slant-frame.js: node_modules $(SRC)
	$(BUILD_PARENT_DIRECTORY)
	$(DUO) -C --type js --global $(GLOBAL_NAMESPACE) < $(MAIN) > $@

##
# Builds CSS dist file
#
dist/slant-frame.css: node_modules $(CSS)
	$(BUILD_PARENT_DIRECTORY)
	cat $(CSS) | $(DUO) -C --type css > $@

##
# Builds node modules
#
node_modules: package.json
	npm install

##
# Cleans all built files
#
.PHONY: clean
clean:
	rm -rf build
	rm -rf components
	rm -rf node_modules

