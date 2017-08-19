'use strict';
const Path = require('path');
const Gulp = require('gulp');
const Newer = require('gulp-newer');
const Concat = require('gulp-concat');
const Less = require('gulp-less');



Gulp.task('less', () => {

    const bundleConfigs = [{
        entries: [
            './client/core/bootstrap.less',
            './client/core/font-awesome.less'
        ],
        dest: './public',
        outputName: 'core.min.css'
    }, {
        entries: './client/layouts/default.less',
        dest: './public/layouts',
        outputName: 'default.min.css'
    }, {
        entries: './client/pages/profile/index.less',
        dest: './public/pages',
        outputName: 'profile.min.css'
    },
    {
        entries: './client/pages/signup/index.less',
        dest: './public/pages',
        outputName: 'signup.min.css'
    },
    {
        entries: './client/pages/adminpanel/index.less',
        dest: './public/pages',
        outputName: 'adminpanel.min.css'
    }, {
        entries: './client/pages/home/index.less',
        dest: './public/pages',
        outputName: 'home.min.css'
    },
    {
        entries: './client/pages/groups/index.less',
        dest: './public/pages',
        outputName: 'groups.min.css'
    },
    {
        entries: './client/pages/accounts/index.less',
        dest: './public/pages',
        outputName: 'accounts.min.css'
    },
    {
        entries: './client/pages/posts/index.less',
        dest: './public/pages',
        outputName: 'posts.min.css'
    },
    {
        entries: './client/pages/mappings/index.less',
        dest: './public/pages',
        outputName: 'mappings.min.css'
    },
    {
        entries: './client/pages/githubupdates/index.less',
        dest: './public/pages',
        outputName: 'githubupdates.min.css'
    }

    ];

    return bundleConfigs.map((bundleConfig) => {

        return Gulp.src(bundleConfig.entries)
            .pipe(Newer(Path.join(bundleConfig.dest, bundleConfig.outputName)))
            .pipe(Concat(bundleConfig.outputName))
            .pipe(Less({ compress: true }))
            .pipe(Gulp.dest(bundleConfig.dest));
    });
});
