## [4.0.4](https://github.com/szimek/signature_pad/compare/v4.0.3...v4.0.4) (2022-04-03)


### Bug Fixes

* clone data in fromData ([#602](https://github.com/szimek/signature_pad/issues/602)) ([e5057c5](https://github.com/szimek/signature_pad/commit/e5057c55e9fdcfd69a1225569374e60f882cfb51))

## [4.0.3](https://github.com/szimek/signature_pad/compare/v4.0.2...v4.0.3) (2022-03-18)


### Bug Fixes

* emit endStroke on pointerup outside of canvas ([#604](https://github.com/szimek/signature_pad/issues/604)) ([29b80dd](https://github.com/szimek/signature_pad/commit/29b80ddc7adcc923b4939e782a413ffc64ba3f5b))

## [4.0.2](https://github.com/szimek/signature_pad/compare/v4.0.1...v4.0.2) (2022-01-21)


### Bug Fixes

* set user-select none on canvas ([#591](https://github.com/szimek/signature_pad/issues/591)) ([59ff331](https://github.com/szimek/signature_pad/commit/59ff3315a276ee3714c5dedce5ffc7014ba078ac))

## [4.0.1](https://github.com/szimek/signature_pad/compare/v4.0.0...v4.0.1) (2022-01-08)


### Bug Fixes

* fix iOS <= 13 ([#581](https://github.com/szimek/signature_pad/pull/581))

### 4.0.0
#### Bug fixes
- Added Anonymous to crossOrigin prop ([#542](https://github.com/szimek/signature_pad/pull/542))
- Set SVG viewBox size from canvas width and height ([#411](https://github.com/szimek/signature_pad/pull/411))
- Save line Properties in point group ([#571](https://github.com/szimek/signature_pad/pull/571))
- Don't throw error when Coordinates are strings ([#573](https://github.com/szimek/signature_pad/pull/573))
- Update Dependencies

#### Features
- Allow offsets when loading image via fromDataURL ([#538](https://github.com/szimek/signature_pad/pull/538))
- Add clear option to fromData ([#570](https://github.com/szimek/signature_pad/pull/570))
- Capture pressure when signing ([#566](https://github.com/szimek/signature_pad/pull/566))

#### Breaking changes
- `dotSize` only accepts a `number` now and no longer accepts a function ([#571](https://github.com/szimek/signature_pad/pull/571))
- SignaturePad is an event emitter. ([#567](https://github.com/szimek/signature_pad/pull/567)) `onBegin` and `onEnd` options have been moved to events.

  The following events were added:
  - `beginStroke`
  - `endStroke`
  - `beforeUpdateStroke`
  - `afterUpdateStroke`

### 3.0.0-beta.4
#### Bug fixes
- Fix race condition / edge case in _strokeUpdate. ([ndbroadbent](https://github.com/ndbroadbent); fixes [#480](https://github.com/szimek/signature_pad/issues/480))
#### Breaking changes
- Remove CommonJS build
- Updated development dependencies (TS 4.x; tslint -> eslint)

### 3.0.0-beta.3
#### Features
- Add initial support for pointer events

### 3.0.0-beta.2
#### Bug fixes
- Fix error in `touchend` event handler.
- Make both params in `#toDataURL` optional to match `Canvas#toDataURL`.

#### Features
- Add optional callback param to `#fromDataURL`.
- Add basic unit tests for SignaturePad class.

### 3.0.0-beta.1
#### Breaking changes
- Rewrite library using TypeScript. TypeScript declaration files are now provided by the library. Hopefully, it should be a bit easier to refactor now...
- Rename generated build files. The new files are:
```bash
dist/signature_pad.js         # unminified CommonJS
dist/signature_pad.min.js     # minified CommonJS
dist/signature_pad.umd.js     # unminified UMD
dist/signature_pad.umd.min.js # minified UMD
dist/signature_pad.m.js       # unminified ES module
dist/signature_pad.m.min.js   # minified ES module
```
- Change structure of data returned from `SignaturePad#toData` method. Each point group now has 2 fields: `color` and `points`. Individual points no longer have `color` field.

#### Bug Fixes
- Allow scrolling via touch after calling `SignaturePad#off` ([felixhammerl](https://github.com/felixhammerl) and [patrickbussmann](https://github.com/patrickbussmann)).

#### Features
- Add very basic unit tests for Point and Bezier classes.

### 2.3.2
#### Bug Fixes
- Fix `fromData` to properly handle color changes. ([szimek](https://github.com/szimek) closes [#302](https://github.com/szimek/signature_pad/issues/302)).

### 2.3.1
#### Bug Fixes
- Fix `minDistance` not being correctly initialized when set to zero. ([remomueller](https://github.com/remomueller) closes [#299](https://github.com/szimek/signature_pad/issues/299)).

### 2.3.0
#### Bug Fixes
- Updated demo to call `SignaturePad#clear` on window resize, to make sure that `SignaturePad#isEmpty` returns the correct value. Closes [#94](https://github.com/szimek/signature_pad/issues/94).

#### Features
- Added `minDistance` option to skip points that are too close to each other (in px). It improves drawing quality (especially when drawing slowly), but introduces small lag. The default value is set to `5`. To switch back to the old behavior, set it to `0`.

### 2.2.1
#### Bug Fixes
- Fix `#toData`/`#fromData` to draw the last point in each curve as well. Fixes [#270](https://github.com/szimek/signature_pad/issues/270).
- Fix `#fromData` to properly set internal data structure. Fixes [#271](https://github.com/szimek/signature_pad/issues/271).

### 2.2.0
#### Bug Fixes
- Export to SVG with correct pen colors. ([DynamoEffects](https://github.com/DynamoEffects) in [#260](https://github.com/szimek/signature_pad/pull/260))

#### Features
- Allow custom ratio/width/height when loading data URL onto canvas. ([halo](https://github.com/halo) in [#253](https://github.com/szimek/signature_pad/pull/253))

### 2.1.1
- Fixed a bug where default value was applied for throttle when throttle was set to 0. ([mkrause](https://github.com/mkrause) in [#247](https://github.com/szimek/signature_pad/pull/247))

### 2.1.0
- No changes since 2.1.0-beta.1.

### 2.1.0-beta.1
- Added throttling. ([@kunukn](https://github.com/kunukn) in [#237](https://github.com/szimek/signature_pad/pull/237))

### 2.0.0
Unfortunately, some breaking changes were introduced in 1.6.0, so to follow the semantic versioning, it's re-released as 2.0.0.
- Removed support for Bower. If you still need it, use [1.5.3](https://github.com/szimek/signature_pad/releases/tag/v1.5.3) release.
- Moved `signature_pad.js` and `signature_pad.min.js` files to `dist` folder.
- Added ES6 version of the library for use with webpack etc.

### 1.6.0 (deprecated in favor of 2.0.0)
- Added support for returning signature as SVG using `#fromDataURL('image/svg+xml')`. [jackspirou](https://github.com/jackspirou) [mymattcarroll](https://github.com/mymattcarroll) [szimek](https://github.com/szimek)
- Added `#toData` method that returns data points.
- Added `#fromData` method that draws signature from data points.
- Moved `signature_pad.js` and `signature_pad.min.js` files to `dist` folder.

### 1.5.3
- Fix `touchend` event on touch devices. (#150) [mtomic](https://github.com/mtomic)
- Fix handling touch events in Egde browser. (#134) [dideldum73](https://github.com/dideldum73)

### 1.5.2
- Prevent loading an empty string in `fromDataURL`. (#108) [Remo](https://github.com/Remo)
- Reject points generated by resting hand (better handling of multi touch). (#48 and #57) [jurreantonisse](https://github.com/jurreantonisse)

### 1.5.1
- Prevent duplicate events on tap in iOS Safari. [PerfectPixel](https://github.com/PerfectPixel)

### 1.5.0
- Add `on` method that rebinds all event handlers. [Alplob](https://github.com/Alplob)

### 1.4.0
- Add `off` method that unbinds all event handlers. [Rob-ot](https://github.com/Rob-ot)

### 1.3.6
- Fix support for Browserify. [chevett](https://github.com/chevett)

### 1.3.5
- Add support for CommonJS/AMD/UMD.

### 1.3.4
- Really fix `fromDataURL` on HiDPI screens.

### 1.3.3
- Fix `fromDataURL` on HiDPI screens.

### 1.3.2
- Fix `onBegin` and `onEnd` callbacks when passed as options to constructor. [yinsee](https://github.com/yinsee)

### 1.3.1
- Fix handling touch events on mobile IE. [tocsoft](https://github.com/tocsoft)

### 1.3.0
- Add `onBegin` and `onEnd` callbacks. [rogerz](https://github.com/rogerz)

### 1.2.4
- Fix bug where stroke becomes very thin. [mvirkkunen](https://github.com/mvirkkunen)

### 1.2.3
- Fix `SignaturePad#fromDataURL` on Firefox. [Fr3nzzy](https://github.com/Fr3nzzy)

### 1.2.2
- Make `SignaturePad#isEmpty` return false after loading an image using `SignaturePad#fromDataURL`. [krisivanov](https://github.com/krisivanov)

### 1.2.1
- Fixed `SignaturePad#clear()`.

### 1.2.0
- Add `backgroundColor` option to set custom color of the background on `SignaturePad#clear()`.
- Rename `color` option to `penColor`.
- Fix passing arguments to canvas element on `SignaturePad#toDataURL()`.
