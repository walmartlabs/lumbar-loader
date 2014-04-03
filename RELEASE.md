# Release Notes

## Development

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v2.0.7...master)

## v2.0.7 - April 3rd, 2014
- Add checkout for specific href w/o data-lumbar - 2acb311

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v2.0.6...v2.0.7)

## v2.0.6 - April 3rd, 2014
- [#19](https://github.com/walmartlabs/lumbar-loader/pull/19) - Treat paths as equal when loading qualified prefix ([@kpdecker](https://api.github.com/users/kpdecker))

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v2.0.5...v2.0.6)

## v2.0.5 - April 1st, 2014
- Update to latest test libs - b805b7b

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v2.0.4...v2.0.5)

## v2.0.4 - March 17th, 2014
- [#18](https://github.com/walmartlabs/lumbar-loader/pull/18) - Argument !== argument ([@patrickkettner](https://api.github.com/users/patrickkettner))

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v2.0.3...v2.0.4)

## v2.0.3 - March 4th, 2014
- [#17](https://github.com/walmartlabs/lumbar-loader/pull/17) - Update for recent fruit-loops changes ([@kpdecker](https://api.github.com/users/kpdecker))

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v2.0.2...v2.0.3)

## v2.0.2 - February 19th, 2014
- [#16](https://github.com/walmartlabs/lumbar-loader/pull/16) - ignore "Invalid Arguments" error when IE tries to `setItem` with certain ([@patrickkettner](https://api.github.com/users/patrickkettner))

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v2.0.1...v2.0.2)

## v2.0.1 - February 13th, 2014
- Fix $serverSide failover declaration - db25815

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v2.0.0...v2.0.1)

## v2.0.0 - February 10th, 2014
- [#11](https://github.com/walmartlabs/lumbar-loader/pull/11) - Server side execution updates ([@kpdecker](https://api.github.com/users/kpdecker))
- Relax style loaded check - 0ba4d68

Compatibility notes:
- Clients must be building with the lumbar server plugin enabled. This is enabled by default in lumbar 2.4.0 and higher.

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.3.1...v2.0.0)

## v1.3.1 - January 18th, 2014
- [#14](https://github.com/walmartlabs/lumbar-loader/pull/14) - Fix pixel ratio detection in IE ([@Candid](https://api.github.com/users/Candid))

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.3.0...v1.3.1)

## v1.3.0 - January 13th, 2014
- Use Costanza for module loading if available - 5e231de

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.2.6...v1.3.0)

## v1.2.6 - December 13th, 2013

- Allow loading without a callback - a10c85d
- Fix loading of non-application base module - 78f6005

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.2.5...v1.2.6)

## v1.2.5 - November 28th, 2013

- [#13](https://github.com/walmartlabs/lumbar-loader/pull/13) - Fix DAY TTL cache expires ([@kpdecker](https://api.github.com/users/kpdecker))

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.2.4...v1.2.5)

## v1.2.4 - November 27th, 2013

- Add firefox case to isQuotaError - 539ef74

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.2.3...v1.2.4)

## v1.2.3 - November 27th, 2013

- Check for error code in quota error detect - af23cd2

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.2.2...v1.2.3)

## v1.2.2 - October 30th, 2013

- Fix status key name for css loader failures - 9496058

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.2.1...v1.2.2)

## v1.2.1 - October 28th, 2013

- [#12](https://github.com/walmartlabs/lumbar-loader/pull/12) - Cleanup xhr event handler ([@kpdecker](https://api.github.com/users/kpdecker))

[Commits](https://github.com/walmartlabs/lumbar-loader/compare/v1.2.0...v1.2.1)

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
