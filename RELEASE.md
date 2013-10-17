# Release Notes

## Development

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.2.0...master)

## v1.2.0 - October 17th, 2013

- [#10](https://github.com/walmartlabs/lumbar-loader/pull/10) - Include additional logging for loader error ([@kpdecker](https://api.github.com/users/kpdecker))

Compatibility notes:
- Errors from the local storage loader now return an object with a subset of:
  - `type` One of `missing-route`, `connection` or `javascript`
  - `moduleName` Name of the module that failed to load + `.js` or `.css` specifier
  - `httpStatus` HTTP response code if a connection failure
  - `exception` Exception thrown when evaluating the module's javascript

  This is a breaking change for any users expecting the string error codes used previously.

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.1.4...v1.2.0)

## v1.1.4 - October 12th, 2013

- [#9](https://github.com/walmartlabs/lumbar-loader/pull/9) - Defer module preload ([@kpdecker](https://api.github.com/users/kpdecker))

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.1.3...v1.1.4)

## v1.1.3 - September 10th, 2013

- [#8](https://github.com/walmartlabs/lumbar-loader/pull/8) - Handle SecurityException under ios7 private browse ([@kpdecker](https://api.github.com/users/kpdecker)

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.1.2...v1.1.3)

## v1.1.2 - June 12th 2013

- Add additional quota error cases detector
- Fix typo in error name

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.1.1...v1.1.2)

## v1.1.1 - June 5th 2013

- Create bower package
- Add cache invalidation via `LocalCache.invalidate`
- `depends` module loading

  Blocks loading of a particular module until all modules listed in the `depends` module key have been loaded.

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.1.0...v1.1.1)
