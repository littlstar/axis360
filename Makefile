
##
# Current working build directory
#
CWD := $(shell pwd)

##
# Node modules bin directory
#
BIN := node_modules/.bin

##
# Path to `browserify' bin file
#
BROWSERIFY := $(BIN)/browserify

##
# Path to `postcss`
#
POSTCSS := $(BIN)/postcss

##
# Path to `babel`
#
BABEL := $(BIN)/babel

##
# Path to `budo`
#
BUDO := $(BIN)/budo

##
# Path to `standard`
#
STANDARD := $(BIN)/standard

##
# CSS source files
#
CSS := $(wildcard src/*.css src/*/*.css)

##
# Module source (js)
#
SRC := $(wildcard src/*.js src/*/*.js)

##
# Main javascript entry
#
MAIN = src/index.js

##
# Main css entry
#
MAINCSS := src/index.css

##
# Global namespace target
#
GLOBAL_NAMESPACE = Axis

##
# Babel ENV
#
BABEL_ENV ?= commonjs

##
# Browserify transform
#
BROWSERIFY_TRANSFORM := --transform babelify

##
# Ensures parent directory is built
#
define BUILD_PARENT_DIRECTORY
	mkdir -p $(dir $@)
endef

##
# Builds everything
#
all: lib dist doc

##
# Builds all files
#
lib: $(SRC) | lib/index.css node_modules
	BABEL_ENV=$(BABEL_ENV) $(BABEL) src --out-dir $@ --source-maps inline
	touch $@

##
# Preprocess css through postcss
#
lib/index.css: $(CSS) node_modules
	$(BUILD_PARENT_DIRECTORY)
	$(POSTCSS) -u autoprefixer $(MAINCSS) -o $@

##
# Builds all dist files
#
dist: dist/axis.js dist/axis.css

##
# Builds javascript dist file
#
dist/axis.js: node_modules $(SRC)
	$(BUILD_PARENT_DIRECTORY)
	$(BROWSERIFY) $(BROWSERIFY_TRANSFORM) --standalone $(GLOBAL_NAMESPACE) $(MAIN) > $@

##
# Builds CSS dist file
#
dist/axis.css: node_modules $(CSS)
	$(BUILD_PARENT_DIRECTORY)
	$(POSTCSS) --use autoprefixer --output $@ $(MAINCSS)

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
# Starts the "example" server
#
.PHONY: example
example:
	$(BUDO) example/index.js --dir example --dir public/assets --live -- $(BROWSERIFY_TRANSFORM)

##
# Cleans all built files
#
.PHONY: clean
clean:
	rm -rf lib
	rm -rf dist

##
# Run standard against the codebase
#
.PHONY: lint
lint: node_modules
	$(STANDARD)
