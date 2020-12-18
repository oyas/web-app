BASE = $(CURDIR)
MODULE = greeter_server

.PHONY: all $(MODULE)
all: version $(MODULE)

$(MODULE):
	go build -v -o $(BASE)/bin/$@

.PHONY: clean version
clean:
	rm -rfv bin
	exit 0

version:
	git rev-parse HEAD
