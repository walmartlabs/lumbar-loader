#! /usr/bin/env bash

phantomjs test/run-qunit.js 'http://localhost:8083/index-standard.html' || exit $?
phantomjs test/run-qunit.js 'http://localhost:8083/index-local.html' || exit $?
