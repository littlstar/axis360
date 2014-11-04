
build: components
	component build

components:
	component install

dist: components
	component build -o . -n slant-frame

.PHONY: build
