## [5.1.3](https://github.com/szimek/signature_pad/compare/v5.1.2...v5.1.3) (2025-12-03)


### Bug Fixes

* disable user selection on Safari to match expected behavior of all other browsers ([#856](https://github.com/szimek/signature_pad/issues/856)) ([5014167](https://github.com/szimek/signature_pad/commit/501416754cc27855d512124bec5c217bf894ea0e))

## [5.1.2](https://github.com/szimek/signature_pad/compare/v5.1.1...v5.1.2) (2025-11-16)


### Bug Fixes

* handle pointercancel/touchcancel to end stroke correctly ([#853](https://github.com/szimek/signature_pad/issues/853)) ([876ef9d](https://github.com/szimek/signature_pad/commit/876ef9da722d36fa9c1a3547422392aa089f0662))

## [5.1.1](https://github.com/szimek/signature_pad/compare/v5.1.0...v5.1.1) (2025-09-16)


### Bug Fixes

* add .js extensions to relative imports ([#844](https://github.com/szimek/signature_pad/issues/844)) ([6732640](https://github.com/szimek/signature_pad/commit/6732640431b43df683de0c291831e636efdea0e4)), closes [#843](https://github.com/szimek/signature_pad/issues/843) [#843](https://github.com/szimek/signature_pad/issues/843) [#843](https://github.com/szimek/signature_pad/issues/843)

# [5.1.0](https://github.com/szimek/signature_pad/compare/v5.0.10...v5.1.0) (2025-09-03)


### Bug Fixes

* update deps ([da7dd1a](https://github.com/szimek/signature_pad/commit/da7dd1a573bda6fa1646696ceda20cc01d1f815b))


### Features

* add includeDataUrl svg option ([ec971d6](https://github.com/szimek/signature_pad/commit/ec971d61ceb12d5d06190078059680274aa52282))
* add redraw method ([2ac4ef4](https://github.com/szimek/signature_pad/commit/2ac4ef42f9c67918cd80176473d95c0716719c2e))

## [5.0.10](https://github.com/szimek/signature_pad/compare/v5.0.9...v5.0.10) (2025-06-20)


### Bug Fixes

* remove isPrimary check ([#836](https://github.com/szimek/signature_pad/issues/836)) ([d4e6f34](https://github.com/szimek/signature_pad/commit/d4e6f3413bc407b2715292d582f38848c1d5e202))
* reset pointerId on stroke end and clear ([#835](https://github.com/szimek/signature_pad/issues/835)) ([8d80d97](https://github.com/szimek/signature_pad/commit/8d80d97e5da80febdf604eb8aa594e5629df6d0f))

## [5.0.9](https://github.com/szimek/signature_pad/compare/v5.0.8...v5.0.9) (2025-06-05)


### Bug Fixes

* check pointerId to prevent multiple pointers ([#830](https://github.com/szimek/signature_pad/issues/830)) ([f6a602b](https://github.com/szimek/signature_pad/commit/f6a602b59ad7865be11fdf5af908fd7dc8c09451))
* update deps ([#831](https://github.com/szimek/signature_pad/issues/831)) ([0dae18c](https://github.com/szimek/signature_pad/commit/0dae18c9405c5a00b58843fafa6bdbfe37d93bd3))

## [5.0.8](https://github.com/szimek/signature_pad/compare/v5.0.7...v5.0.8) (2025-06-05)


### Bug Fixes

* explicitly set passive: false on listeners ([#829](https://github.com/szimek/signature_pad/issues/829)) ([d28a170](https://github.com/szimek/signature_pad/commit/d28a1707fb6d4416cc4bafbe5793fce82cb60e68))

## [5.0.7](https://github.com/szimek/signature_pad/compare/v5.0.6...v5.0.7) (2025-03-19)


### Bug Fixes

* export BasicPoint type ([#820](https://github.com/szimek/signature_pad/issues/820)) ([8732c65](https://github.com/szimek/signature_pad/commit/8732c6526e22e0d3ab372c2be59a2768a9106c79))

## [5.0.6](https://github.com/szimek/signature_pad/compare/v5.0.5...v5.0.6) (2025-03-14)


### Bug Fixes

* add "types" to "exports" in package.json ([#817](https://github.com/szimek/signature_pad/issues/817)) ([5623be7](https://github.com/szimek/signature_pad/commit/5623be7242b63ba486a1deb2781ed51bab865baa))

## [5.0.5](https://github.com/szimek/signature_pad/compare/v5.0.4...v5.0.5) (2025-03-14)


### Bug Fixes

* Add conditional exports to package.json ([#815](https://github.com/szimek/signature_pad/issues/815)) ([005a090](https://github.com/szimek/signature_pad/commit/005a090ef3c37e7bb9adbf7ad5ace57846f4548b))

## [5.0.4](https://github.com/szimek/signature_pad/compare/v5.0.3...v5.0.4) (2024-10-17)


### Bug Fixes

* prevent non-primary for pointer events ([#796](https://github.com/szimek/signature_pad/issues/796)) ([956450c](https://github.com/szimek/signature_pad/commit/956450cae2b8706db96fe8ba10dae85f5c82979b))
* update deps ([#797](https://github.com/szimek/signature_pad/issues/797)) ([6191456](https://github.com/szimek/signature_pad/commit/61914563af5f223177b0d8cd215bab56a5b59ed5))

## [5.0.3](https://github.com/szimek/signature_pad/compare/v5.0.2...v5.0.3) (2024-08-23)


### Bug Fixes

* prevent division by zero in bezier ([#785](https://github.com/szimek/signature_pad/issues/785)) ([1ca425e](https://github.com/szimek/signature_pad/commit/1ca425eed94a72f4e679df03db1785f4e2147d08))

## [5.0.2](https://github.com/szimek/signature_pad/compare/v5.0.1...v5.0.2) (2024-06-10)


### Bug Fixes

* cast type instead of global namespace ([#773](https://github.com/szimek/signature_pad/issues/773)) ([caf901b](https://github.com/szimek/signature_pad/commit/caf901be958f2b1bd42168e157ee072111a50a99))

## [5.0.1](https://github.com/szimek/signature_pad/compare/v5.0.0...v5.0.1) (2024-05-18)


### Bug Fixes

* Use fallback values when options object contains explicit `undefined` values ([#772](https://github.com/szimek/signature_pad/issues/772)) ([fe11e16](https://github.com/szimek/signature_pad/commit/fe11e1623901b45005f7135a68f98cd3dd39cd24))

# [5.0.0](https://github.com/szimek/signature_pad/compare/v4.2.0...v5.0.0) (2024-05-03)


### Bug Fixes

* allow drawing outside canvas for a smoother signature ([#765](https://github.com/szimek/signature_pad/issues/765)) ([29a8b5a](https://github.com/szimek/signature_pad/commit/29a8b5a2a19387782c3eec1055389011eb7f9699))
* update deps ([1955364](https://github.com/szimek/signature_pad/commit/19553647cfcc8f07578e25f04e3897fad6116411))


### BREAKING CHANGES

* - Drawing outside of the canvas will record data outside the canvas
- Update SignatureEvent to store the original event, x, y, pressure
- move and up events are attached once down is triggered and they are on the window/ownerDocument target

# [5.0.0-beta.1](https://github.com/szimek/signature_pad/compare/v4.2.0...v5.0.0-beta.1) (2024-04-05)


### Bug Fixes

* allow drawing outside canvas for a smoother signature ([#765](https://github.com/szimek/signature_pad/issues/765)) ([29a8b5a](https://github.com/szimek/signature_pad/commit/29a8b5a2a19387782c3eec1055389011eb7f9699))


### BREAKING CHANGES

* Drawing outside of the canvas will record data outside the canvas
* Update SignatureEvent to store the original event, x, y, pressure
* move and up events are attached once down is triggered and they are on the window/ownerDocument target

#### v4:

![sig1](https://user-images.githubusercontent.com/97994/221343969-1d8b0353-1e03-4205-9904-9587974cf11e.gif)

#### v5

![sig2](https://github.com/szimek/signature_pad/assets/97994/b9f1cfc2-aef5-4320-b97c-9fbb5cfe98ed)

# [4.2.0](https://github.com/szimek/signature_pad/compare/v4.1.7...v4.2.0) (2024-03-10)


### Features

* add canvasContextOptions API for use by the getContext ([#761](https://github.com/szimek/signature_pad/issues/761)) ([7abdd48](https://github.com/szimek/signature_pad/commit/7abdd48a50bd13c4bb508018c80babcaf782bbd4))

## [4.1.7](https://github.com/szimek/signature_pad/compare/v4.1.6...v4.1.7) (2023-11-16)


### Bug Fixes

* make beginStroke event cancelable ([#744](https://github.com/szimek/signature_pad/issues/744)) ([315462e](https://github.com/szimek/signature_pad/commit/315462e90c95a2fdee1b5b2e406a39756aa55bdb))
* update deps ([#745](https://github.com/szimek/signature_pad/issues/745)) ([e5e0595](https://github.com/szimek/signature_pad/commit/e5e0595bb6a648e2962a796a9b850e5500c421c5))

## [4.1.6](https://github.com/szimek/signature_pad/compare/v4.1.5...v4.1.6) (2023-07-17)


### Bug Fixes

* **eraser:** solves issues with eraser ([#725](https://github.com/szimek/signature_pad/issues/725)) ([4d881e6](https://github.com/szimek/signature_pad/commit/4d881e633625a8ea322d51345283fdbcc3632c10))

## [4.1.5](https://github.com/szimek/signature_pad/compare/v4.1.4...v4.1.5) (2023-02-22)


### Bug Fixes

* initialize private properties. ([#700](https://github.com/szimek/signature_pad/issues/700)) ([fea7ec6](https://github.com/szimek/signature_pad/commit/fea7ec653abe0850a56d796571b850dfa65b05df)), closes [#699](https://github.com/szimek/signature_pad/issues/699)

## [4.1.4](https://github.com/szimek/signature_pad/compare/v4.1.3...v4.1.4) (2022-11-08)


### Bug Fixes

* undo fix zoom ([#674](https://github.com/szimek/signature_pad/issues/674)) ([7d67010](https://github.com/szimek/signature_pad/commit/7d67010ca90344d6e340ad88d831e905bac0d519))

## [4.1.3](https://github.com/szimek/signature_pad/compare/v4.1.2...v4.1.3) (2022-11-01)


### Bug Fixes

* fix version in built files ([2e0ec92](https://github.com/szimek/signature_pad/commit/2e0ec92400e86f272f643a3ce4e2a51398426e60))

## [4.1.2](https://github.com/szimek/signature_pad/compare/v4.1.1...v4.1.2) (2022-11-01)


### Bug Fixes

* fix zoom ([#673](https://github.com/szimek/signature_pad/issues/673)) ([4a15227](https://github.com/szimek/signature_pad/commit/4a15227bf80ebdb1509dfc1f8fffe920d1616968))

## [4.1.1](https://github.com/szimek/signature_pad/compare/v4.1.0...v4.1.1) (2022-10-31)


### Bug Fixes

* Fix empty `toDataURL()` in TypeScript ([#672](https://github.com/szimek/signature_pad/issues/672)) ([0ce27f0](https://github.com/szimek/signature_pad/commit/0ce27f0124b4694535e122d60334eb30cf789038))

# [4.1.0](https://github.com/szimek/signature_pad/compare/v4.0.10...v4.1.0) (2022-10-30)


### Features

* add toSVG method ([#668](https://github.com/szimek/signature_pad/issues/668)) ([c341107](https://github.com/szimek/signature_pad/commit/c34110752be5925315b8de71df3b896a09a1fe64))

## [4.0.10](https://github.com/szimek/signature_pad/compare/v4.0.9...v4.0.10) (2022-10-12)


### Bug Fixes

* update deps ([#660](https://github.com/szimek/signature_pad/issues/660)) ([0ae1ed2](https://github.com/szimek/signature_pad/commit/0ae1ed27b2b21b222a1844c7f87a9581dc756ae1))

## [4.0.9](https://github.com/szimek/signature_pad/compare/v4.0.8...v4.0.9) (2022-09-24)


### Bug Fixes

* add velocityFilterWeight to point group options ([ed6c139](https://github.com/szimek/signature_pad/commit/ed6c1393cea08c6f19f739c4bfee79154646c8d6))
* use point group options in calculations ([7495eae](https://github.com/szimek/signature_pad/commit/7495eae43d83a6711ccb6b80f7f7e5831a201e82))

## [4.0.8](https://github.com/szimek/signature_pad/compare/v4.0.7...v4.0.8) (2022-09-13)


### Bug Fixes

* fix svg image size ([#650](https://github.com/szimek/signature_pad/issues/650)) ([27cd493](https://github.com/szimek/signature_pad/commit/27cd4937f6373e1532352a7b0016f2735ff66160))

## [4.0.7](https://github.com/szimek/signature_pad/compare/v4.0.6...v4.0.7) (2022-07-21)


### Bug Fixes

* use canvas.ownerDocument in mouse events in case it is different from window.document ([#637](https://github.com/szimek/signature_pad/issues/637)) ([636a503](https://github.com/szimek/signature_pad/commit/636a503d7e850a3e3d7489396f3e116c0e11aeb1))

## [4.0.6](https://github.com/szimek/signature_pad/compare/v4.0.5...v4.0.6) (2022-07-18)


### Bug Fixes

* check for event.cancelable in touch events ([#634](https://github.com/szimek/signature_pad/issues/634)) ([21ab3c7](https://github.com/szimek/signature_pad/commit/21ab3c7f3d8c545a3ad4d9c92682000628019b08))

## [4.0.5](https://github.com/szimek/signature_pad/compare/v4.0.4...v4.0.5) (2022-06-06)


### Bug Fixes

* update deps including yarn ([#625](https://github.com/szimek/signature_pad/issues/625)) ([1ad4e30](https://github.com/szimek/signature_pad/commit/1ad4e30f9ecccd1ddb6f9afc11360087a8b0fe22))

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
