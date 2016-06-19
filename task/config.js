var config = {
    jade : {
        src:'src/public/jade/**/*.jade',
        dest:'build/pages'
    },
    sass : {
        src : 'src/public/sass/**/*.scss',
        dest: 'build/public/entry'
    },
    scripts:{
        src : 'src/public/js/**/*.js',
        dest: 'build/public/entry'
    },
    images:{
        src: 'src/public/img/**/*',
        dest: 'build/public/img'
    },
    static:{
        src: 'src/public/font/*.+(eot|svg|ttf|woff)',
        base:'src/public',
        dest:'build/public'
    },
    seo:{
        beta: 'src/seo/beta/**',
        release: 'src/seo/release/**',
        dest:'build'
    },
    noMD5:{
        src: 'build/**/no-md5/**'
    }
};
module.exports = config;
