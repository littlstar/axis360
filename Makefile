
build: components
	component build

components:
	component install

dist: components
	component build -o . -s SlantFrame -n slant-frame

.PHONY: build
