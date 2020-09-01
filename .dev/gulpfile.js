const { series, parallel, src, dest, watch } = require('gulp');
const browserSync = require('browser-sync').create();
const fork = require('child_process').fork;

const hb = require('gulp-hb');
const htmlmin = require('gulp-htmlmin');

const stylus = require('gulp-stylus');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');
const sourcemaps = require('gulp-sourcemaps');

const imagemin = require('gulp-imagemin');

const del = require('del');

const srcDir = '../src';
const destDir = '../dist';
const buildDir = '../build';

const path = {
    src: {
        templates: `${srcDir}/html`,
        styles: `${srcDir}/css`,
        scripts: `${srcDir}/js`,
        images: `${srcDir}/img`,
        static: `${srcDir}/static`,
    },
    dest: {
        templates: destDir,
        styles: `${destDir}/css`,
        scripts: `${destDir}/js`,
        images: `${destDir}/img`,
    },
};

let scoServer;
const startUpErrors = [];
let started = false;
const onError = task => error => {
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
const onSuccess = task => () => {
    if (started) {
        scoServer.send({ task, error: false });
    }
};

const siteConveyer = cb => {
    scoServer = fork('./panel-server.js', [], { stdio: 'pipe' });

    cb();
};

// Templates: Handlebars -> Html
const templates = () => {
    const basePath = path.src.templates;
    const dirs = {
        partials: 'partials',
        helpers: 'helpers',
        decorators: 'decorators',
        data: 'data',
    };

    const error = onError('templates');
    const success = onSuccess('templates');

    const hbStream = hb().on('error', error)
        .partials(`${basePath}/${dirs.partials}/**/*.{hbs,js}`).on('error', error)
        .helpers(`${basePath}/${dirs.helpers}/**/*.js`).on('error', error)
        .decorators(`${basePath}/${dirs.decorators}/**/*.js`).on('error', error)
        .data(`${basePath}/${dirs.data}/**/*.{js,json}`).on('error', error);

    return src(`${basePath}/**/*.html`)
        .pipe(hbStream)
        .pipe(htmlmin({
            collapseWhitespace: true,
        }).on('error', error))
        .pipe(dest(path.dest.templates))
        .on('end', success);
};

// Styles: Stylus -> Css & auto-inject into browsers
const styles = () => {
    let wasError = false;

    return src(`${path.src.styles}/*.styl`)
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: true,
        }).on('error', function(err) {
            onError('styles')(err);
            wasError = true;
            this.emit('end');
        }))
        .pipe(postcss([
            autoprefixer({
                cascade: true,
            }),
        ]).on('error', function(err) {
            onError('styles')(err);
            wasError = true;
            this.emit('end', true);
        }))
        .pipe(sourcemaps.write('../sourcemaps'))
        .pipe(dest(path.dest.styles))
        .on('end', () => {
            if (!wasError) {
                onSuccess('styles')();
            }
        })
        .pipe(browserSync.stream());
};

// Scripts: ES6 -> JS
const scripts = () =>
    src(`${path.src.scripts}/*.{js,es}`)
        .pipe(sourcemaps.init())
        .pipe(rollup(
            {
                plugins: [
                    babel(),
                    terser(),
                ],
            },
            'umd',
        ).on('error', onError('scripts')))
        .pipe(sourcemaps.write('../sourcemaps'))
        .pipe(dest(path.dest.scripts))
        .on('end', onSuccess('scripts'));

// Images: optimizing
const images = () =>
    src(`${path.src.images}/**/*`)
        // .pipe(imagemin().on('error', onError('images')))
        .pipe(dest(path.dest.images))
        .on('end', onSuccess('images'));

// Static files
const static = () =>
    src(`${path.src.static}/**/*`, { dot: true })
        .pipe(dest(destDir));

// Copy vendors
const vendorStyles = () =>
    src(`${path.src.styles}/vendor/**/*`)
        .pipe(dest(`${path.dest.styles}/vendor`));
const vendorScripts = () =>
    src(`${path.src.scripts}/vendor/**/*`)
        .pipe(dest(`${path.dest.scripts}/vendor`));
const vendor = parallel(
    vendorStyles,
    vendorScripts,
);

// Clean dirs
const cleanDist = () => del(destDir, { force: true });
const cleanBuild = () => del(buildDir, { force: true });

const makeDist = series(
    cleanDist,
    parallel(
        templates,
        styles,
        scripts,
        images,
        static,
        vendor,
    ),
);

const serve = series(
    parallel(
        makeDist,
        siteConveyer,
    ),
    () => {
        started = true;
        if (startUpErrors.length) {
            startUpErrors.forEach(scoServer.send.bind(scoServer));
            // scoServer.send({ error: startUpErrors });
            startUpErrors.splice(0, startUpErrors.length);
        }

        browserSync.init({
            open: false,
            server: {
                baseDir: destDir,
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

        watch(`${path.dest.templates}/*`).on('change', browserSync.reload);
        watch(`${path.src.templates}/**/*`, templates);

        watch(`${path.src.styles}/**/*`, styles);

        watch(`${path.dest.scripts}/**/*`).on('change', browserSync.reload);
        watch(`${path.src.scripts}/**/*`, scripts);

        watch(`${path.dest.images}/**/*`).on('change', browserSync.reload);
        watch(`${path.src.images}/**/*`, images);
    },
);

const build = series(
    parallel(
        cleanBuild,
        makeDist,
    ),
    () => {
        return src(
            [
                `${destDir}/**/*`,
                `!${destDir}/sourcemaps`,
                `!${destDir}/sourcemaps/**`,
            ],
            { dot: true },
        )
            .pipe(dest(buildDir));
    },
);

exports.build = build;
exports.default = serve;
