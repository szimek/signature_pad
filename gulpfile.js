const del = require('del');
const gulp = require('gulp');
const rollup = require('rollup');

const configs = require('./rollup.configs');

gulp.task('clean', () => del('dist'));

gulp.task('build', ['clean'], (done) => {
  const bundles = configs.map(config =>
    rollup.rollup(config.rollup)
      .then(bundle => bundle.write(config.bundle))
  );

  Promise.all(bundles).then(() => done());
});

gulp.task('copy', ['build'], () =>
  gulp
    .src('dist/signature_pad.js')
    .pipe(gulp.dest('example/js/'))
);

gulp.task('watch', ['copy'], () =>
  gulp.watch('src/**/*.*', {
    read: false,
    debounceDelay: 50,
  }, ['copy'])
);

gulp.task('default', ['copy']);
