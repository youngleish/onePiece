var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var config = require('./task/config');
var userConf = require('./task/user-conf');
var minimist = require('minimist'); // node命令参数解析引擎
var argv = minimist(process.argv.slice(2));
var release = argv.release;
var watch = argv.watch;
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');
var stylish = require('jshint-stylish');
var pngquant = require('imagemin-pngquant');//深度压缩png图片
var es = require('event-stream');
var del = require('del');


//编译jade然后压缩html
gulp.task('jade',function(){
    var opts = {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes:true,
        minifyJS: true,
        minifyCSS: true
    };
    return gulp.src(config.jade.src)
        .pipe($.plumber())
        .pipe($.data(function(file){//jade编译前,data会往jade种注入一个对象,通过判断这个对象来处理jade种是否进行某些操作
            return {
                analytics: argv.cdn && argv.release
            };
        }))
        .pipe($.jade({pretty:true,compileDebug:true}))
        .pipe($.changed(config.jade.dest,{extension:'.html',hasChanged: $.changed.compareSha1Digest}))
        .pipe($.debug({title:'jade编译'}))
        .pipe($.if(!watch,$.htmlmin(opts)))
        .pipe(gulp.dest(config.jade.dest));
});
//sass任务:编译sass,y生成压缩文件,自动添加前缀
gulp.task('sass',function(){
    return gulp.src(config.sass.src)
        .pipe($.if(!release,$.sourcemaps.init())) //判断是否是部署环境，决定是否进行sourcemaps编译
        .pipe($.plumber())
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers :['last 2 versions','>10%','Android >= 4.0']}))
        .pipe($.if(release,$.cleanCss())) //生产环境才会压缩css
        .pipe($.if(!release,$.sourcemaps.write('./maps')))
        .pipe($.changed(config.sass.dest,{extension:'.css',hasChanged: $.changed.compareSha1Digest}))
        .pipe($.debug({title:'sass编译:'}))
        .pipe(gulp.dest(config.sass.dest));
});
//压缩js
gulp.task('scripts',function(){
    return gulp.src(config.scripts.src)
        .pipe($.changed(config.scripts.dest,{haschanged: $.changed.compareSha1Digest}))
        .pipe($.if(release, $.uglify({
            mangle:false,
            compress:false,
            preserveComments:'license'
        })))
        .pipe($.debug({title:'压缩js'}))
        .pipe(gulp.dest(config.scripts.dest));
});
//自动刷新
gulp.task('serve',function(){
    browserSync.init({
        proxy: userConf.browserSync.proxy,
        files: ['build/**', '!build/**/*.maps'],
        startPath: userConf.browserSync.startPath
    });
});
//js错误监控
gulp.task('lint', function () {
    if (!argv.release) {
        return gulp.src('src/public/js/**/*.js')
            .pipe($.jshint())
            .pipe($.jshint.reporter(stylish));
    }
});
//压缩图片
gulp.task('img',function(){
    return gulp.src(config.images.src)
        .pipe($.imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant({quality: '65-80'})] //使用pngquant深度压缩png图片的imagemin插件
        }))
        //.pipe($.debug({title:'图片压缩:'}))
        .pipe(gulp.dest(config.images.dest));
});
//处理静态资源
gulp.task('static',function(){
    return gulp.src(config.static.src,{base:config.static.base})
        .pipe($.changed(config.static.dest))
        .pipe($.debug({title:'静态:'}))
        .pipe(gulp.dest(config.static.dest));
});
//seo 告诉爬虫服务器什么样的文件可以被查看
gulp.task('seo',function(){
    if(release){
        var path;
        if(argv.cdn){
            path = config.seo.release;
        }else{
            path = config.seo.beta;
        }
        return gulp.src(path)
            .pipe(gulp.dest(config.seo.dest));
    }
});
gulp.task('watch',function(){
    gulp.watch(config.sass.src,['sass']);
    gulp.watch(config.jade.src,['jade']);
    gulp.watch(config.scripts.src,['scripts']);
    gulp.watch(config.images.src,['img']);
    gulp.watch(config.static.src,['static']);
});
//添加md5戳
gulp.task('rev-all',function(){
    var revConf = {
        dontGlobal: ['robots.txt'],
        dontRenameFile: ['.html'],
        dontUpdateReference: ['.html'],
        //debug : true,
        annotator : function(contents,path){
            var fragments = [{'contents' : contents,'path': path}];
            return fragments;
        },
        replacer: function(fragment, replaceRegExp, newReference, referencedFile) {
            if (/\.js$/.test(fragment.path)) {
                console.log(22);
                if (referencedFile.revFilenameExtOriginal === '.js') {
                    // TODO: md5的问题，这里调试看看问题所在；
                    console.log(fragment.path, referencedFile.revPathOriginal,  referencedFile.revFilenameOriginal, newReference, referencedFile.revFilenameExtOriginal);
                    return;
                } else if (referencedFile.revFilenameExtOriginal === '.css') {
                    console.log(fragment.path, referencedFile.revPathOriginal,  referencedFile.revFilenameOriginal, newReference, referencedFile.revFilenameExtOriginal);
                    return;
                }
            }
            fragment.contents = fragment.contents.replace(replaceRegExp, '$1' + newReference + '$3$4');
        }
    };
    if(argv.cdn){
        revConf.prefix = 'http://m-cdn.com';
    }
    var revAll = new $.revAll(revConf);
    var stream1 = gulp.src(config.noMD5.src)
        .pipe(gulp.dest('publish'));
    var stream2 = gulp.src(['build/**','!' + config.noMD5.src])
        .pipe(revAll.revision())
        .pipe(gulp.dest('publish'))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('publish'));
    return es.concat([stream1, stream2]);

});
//清空build 和 publish
gulp.task('clean-build',function(){
    return del('build');
});
gulp.task('clean-publish',function(){
    return del('publish');
});

gulp.task('build',['lint','sass','jade','scripts','img','static','seo'],function(cb){
    cb();
});

gulp.task('default',function(cb){
    if(release){
        runSequence(['clean-build','clean-publish'],'build',function(){
            runSequence('rev-all',cb);
        });
    }else if(watch){
        runSequence('build','watch','serve',cb);
    }else{
        runSequence('build',cb);
    }
});

/*命令说明
 * gulp 执行的操作 build
 * gulp --watch 执行的操作 build serve watch(不会压缩html,其他命令会压缩html)
 * gulp --release 执行的操作 clean build rev-all 添加了1)js和css的压缩操作 2)seo 减少了1)sass任务种的sourcemap操作2)lint任务
 * gulp --release --cdn 这是上线的操作命令 执行操作添加了 1)rev-all任务种的cdn功能 2)jade编译会加上统计代码
 *
 *
 * */


