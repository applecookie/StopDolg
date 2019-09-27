const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const run = require('run-sequence');
const fork = require('child_process').fork;

const hb = require('gulp-hb');
const htmlmin = require('gulp-htmlmin');

const stylus = require('gulp-stylus');
const autoprefixer = require('gulp-autoprefixer');

const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');

const imagemin = require('gulp-imagemin');

const clean = require('gulp-clean');

const srcPath = '../src';
const destPath = '../dist';
const buildPath = '../build';
const src = {
    templates: `${srcPath}/html`,
    styles: `${srcPath}/css`,
    scripts: `${srcPath}/js`,
    images: `${srcPath}/img`,
    static: `${srcPath}/static`,
};
const dest = {
    templates: destPath,
    styles: `${destPath}/css`,
    scripts: `${destPath}/js`,
    images: `${destPath}/img`,
};

let scoServer;
const startUpErrors = [];
let started = false;
const onGulpSuccess = task => {
    if (started) {
        scoServer.send({ task, error: false });
    }
};
const onGulpError = (task, error) => {
    console.log();
    console.error(error.message);

    if (started) {
        scoServer.send({ task, error: error });
    } else {
        startUpErrors.push({
            task,
            error,
        });
    }
};
const wrapPipe = (task, taskFn) => function(done) {
    const onSuccess = () => {
        onGulpSuccess(task);
        done();
    };
    const onError = err => {
        onGulpError(task, err);
        done(err);
    };
    const outStream = taskFn(onSuccess, onError);
    if (outStream && typeof outStream.on === 'function') {
        outStream.on('end', onSuccess);
    }
};

// SiteConveyer serer
gulp.task('site-conveyer', done => {
    scoServer = fork('./panel-server.js', { stdio: 'pipe' });

    done();
});

// Static Server + watching files
gulp.task('serve', ['makeDist', 'site-conveyer'], () => {
    started = true;
    if (startUpErrors.length) {
        startUpErrors.forEach(scoServer.send.bind(scoServer));
        // scoServer.send({ error: startUpErrors });
        startUpErrors.splice(0, startUpErrors.length);
    }

    browserSync.init({
        open: false,
        server: {
            baseDir: destPath,
            routes: {
                '/.dev': './panel',
            },
        },
        snippetOptions: {
            rule: {
                match: /<\/body>/i,
                fn: function(snippet, match) {
                    return snippet + '<script src="/.dev/js/sco.js"></script>' + match;
                },
            },
        },
    });

    gulp.watch(`${dest.templates}/*`).on('change', browserSync.reload);
    gulp.watch(`${src.templates}/**/*`, ['templates']);

    gulp.watch(`${src.styles}/**/*`, ['styles']);

    gulp.watch(`${dest.scripts}/**/*`).on('change', browserSync.reload);
    gulp.watch(`${src.scripts}/**/*`, ['scripts']);

    gulp.watch(`${dest.images}/**/*`).on('change', browserSync.reload);
    gulp.watch(`${src.images}/**/*`, ['images']);
});

// Templates: Handlebars -> Html
gulp.task('templates', wrapPipe('templates', (success, error) => {
    const basePath = src.templates;
    const dirs = {
        partials: 'partials',
        helpers: 'helpers',
        decorators: 'decorators',
        data: 'data',
    };

    const hbStream = hb().on('error', error)
        .partials(`${basePath}/${dirs.partials}/**/*.{hbs,js}`).on('error', error)
        .helpers(`${basePath}/${dirs.helpers}/**/*.js`).on('error', error)
        .decorators(`${basePath}/${dirs.decorators}/**/*.js`).on('error', error)
        .data(`${basePath}/${dirs.data}/**/*.{js,json}`).on('error', error);

    return gulp
        .src(`${basePath}/**/*.html`)
        .pipe(hbStream)
        .pipe(htmlmin({
            collapseWhitespace: true,
        }).on('error', error))
        .pipe(gulp.dest(dest.templates));
}));

// Styles: Stylus -> Css & auto-inject into browsers
gulp.task('styles', () => {
    const basePath = src.styles;
    const mapsPath = '../sourcemaps';

    let wasError = false;

    return gulp
        .src(`${basePath}/*.styl`)
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: true,
        }).on('error', function(err) {
            onGulpError('styles', err);
            wasError = true;
            this.emit('end');
        }))
        .pipe(autoprefixer({
            browsers: [
                "ie 6",
                // "Edge >= 16",
                // "ff >= 59",
                // "Chrome >= 49",
                // "and_chr >= 66",
                // "Safari >= 11",
                // "ios_saf >= 10.3",
                // ">= 5%"
            ],
            cascade: true,
        }).on('error', function(err) {
            onGulpError('styles', err);
            wasError = true;
            this.emit('end', true);
        }))
        .pipe(sourcemaps.write(mapsPath))
        .pipe(gulp.dest(dest.styles))
        .on('end', () => {
            if (!wasError) {
                onGulpSuccess('styles');
            }
        })
        .pipe(browserSync.stream());
});

// Scripts: ES6 -> JS
gulp.task('scripts', wrapPipe('scripts', (success, error) => {
    const basePath = src.scripts;
    const mapsPath = '../sourcemaps';

    return gulp
        .src(`${basePath}/*.{js,es}`)
        .pipe(sourcemaps.init())
        .pipe(rollup(
            {
                plugins: [
                    babel(),
                    uglify(),
                ],
            },
            'umd',
        ).on('error', error))
        .pipe(sourcemaps.write(mapsPath))
        .pipe(gulp.dest(dest.scripts));
}));

// Images: optimizing
gulp.task('images', wrapPipe('images', (success, error) => {
    const basePath = src.images;

    return gulp
        .src(`${basePath}/**/*`)
        .pipe(imagemin().on('error', error))
        .pipe(gulp.dest(dest.images));
}));

// Static files
gulp.task('static', () => {
    return gulp
        .src(`${src.static}/**/*`, { dot: true })
        .pipe(gulp.dest(destPath));
});

// Copy vendors
gulp.task('vendor-styles', () => {
    return gulp
        .src(`${src.styles}/vendor/**/*`)
        .pipe(gulp.dest(`${dest.styles}/vendor`));
});
gulp.task('vendor-scripts', () => {
    return gulp
        .src(`${src.scripts}/vendor/**/*`)
        .pipe(gulp.dest(`${dest.scripts}/vendor`));
});
gulp.task('vendor', done => {
    run(['vendor-styles', 'vendor-scripts'], done);
});

// Clean dist dir
gulp.task('cleanDist', () => {
    return gulp.src(destPath, { read: false })
        .pipe(clean({ force: true }));
});

gulp.task('makeDist', ['cleanDist'], done => {
    run(['templates', 'styles', 'scripts', 'images', 'static', 'vendor'], done);
});

// Clean build dir
gulp.task('cleanBuild', () => {
    return gulp
        .src(buildPath, { read: false })
        .pipe(clean({ force: true }));
});
// Build
gulp.task('build', ['makeDist', 'cleanBuild'], () => {
    return gulp
        .src([`${destPath}/**/*`, `!${destPath}/sourcemaps`, `!${destPath}/sourcemaps/**`], { dot: true })
        .pipe(gulp.dest(buildPath));
});

gulp.task('default', ['serve']);
