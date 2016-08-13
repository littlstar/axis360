
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
# Path to `budo`
#
BUDO := $(BIN)/budo

##
# CSS source files
#
CSS := *.css

##
# Module source (js)
#
SRC := $(wildcard *.js)
SRC += $(wildcard projection/*.js)
SRC += $(wildcard geometry/*.js)
SRC += $(wildcard controls/*.js)

##
# Main javascript entry
#
MAIN = index.js

##
# Main css entry
#
MAINCSS := index.css

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
	$(BROWSERIFY) --standalone $(GLOBAL_NAMESPACE) $(MAIN) > $@

##
# Builds CSS source files
#
build/build.css: node_modules $(CSS)
	$(BUILD_PARENT_DIRECTORY)
	$(POSTCSS) --use autoprefixer --output $@ $(MAINCSS)

##
# Builds all dist files
#
dist: dist/axis.js dist/axis.css

##
# Builds javascript dist file
#
dist/axis.js: node_modules $(SRC)
	$(BUILD_PARENT_DIRECTORY)
	$(BROWSERIFY) --standalone $(GLOBAL_NAMESPACE) $(MAIN) > $@

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
	$(BUDO) example/index.js --dir example --dir public/assets --live

##
# Cleans all built files
#
.PHONY: clean
clean:
	rm -rf build
	rm -rf components
