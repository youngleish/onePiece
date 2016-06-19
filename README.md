## Gulp自动化构建项目实践
### 一.项目目录结构
````
|—— build
|   ├── pages
|      ├── h5
|          └── index.html
|   ├── public
|       ├── entry
|           ├── h5
|               ├── index.js
|               ├── index.css
|               ├── common.js
|               └── common.css
|       ├── font
|           ├── iconmoon.eot
|           ├── iconmoon.svg
|           ├── iconmoon.ttf
|           └── iconmoon.woff
|       ├── h5
|           └──  index
|                └──  banner.png
|—— src
|   └── public
|       ├── component 组件
|       ├── font iconmoon生成的字体图标
|       ├── jade
|           ├── helper
|               ├── base.jade
|               └── base.css
|           ├── pages
|               ├── h5
|                   └── index.jad
|       ├── js
|           ├── component
|               └── weixin-share.js
|           ├── config
|               └── url.js
|           ├── entry
|               ├── common.js
|               └── h5
|                   └── index.js
|           ├── lib
|               ├── zepto.js
|               └── lazyload.js
|           ├── util
|               ├── util.js
|               └── am.js
|           └── templates
|               ├── helpers
|                   └── staticPath.js
|               └── h5
|                   └── index.hbs
|       ├── scss
|           ├── base
|               ├── reset.scss
|               └── base.scss
|           ├── components
|               ├── _icon.scss
|               └── _swiper.scss
|           ├── helpers
|               ├── _function.scss
|               ├── _mixins.scss
|               └── _variables.scss
|           └── pages
|               ├── h5
|                   ├── index.scss
|               └── common.scss
|       ├── img
|           └──  h5
|               └── banner.png
|—— task
|       ├── user-conf.js
|       └──  config.js
|—— config.rb
└── gulpfiles.js
````
### 二.插件介绍
> http://pinkyjie.com/2015/08/02/commonly-used-gulp-plugins-part-1/
#### gulp-plumber
> plumber有水管工的意思,水管工可以修理坏的水管,保证水流按照管道流动.
>
> 所以该插件主要是处理错误信息,保证gulp的stream正常"流动", 任务出错时不会跳出当前任务,使得wacth能够正常进行.

#### gulp-load-plugins
> 加载package.json中所有dependencis种列出测**gulp**插件' ,有两个连字符的插件则会自动命名为驼峰格式.

#### gulp-sass
> 编译sass的插件
- options
    - outputStyle 编译后的格式:expanded 输出后保持原格式 :nested :compact :compressed 压缩格式
- 错误监控
    - .on('error',$.sass.logError)

#### gulp-sourceMaps
> 来源地图
> sourcemaps会在编译后的文件底部添加sourceMappingURL,并生成.map的文件,帮助把编译后的文件映射到'源码'位置,方便调试.

#### gulp-autoprefixer
> 自动处理浏览器前缀
- options
    - browser 浏览器版本 值为数组[last 2 versions,> 5%]
        - last 2 versions 主流浏览器最新2个版本
        - last 1 Chrome versions 谷歌最新1个版本
        - Firefox >= 20 火狐大于或等于20的版本
        - '>5%'全球统计大于5%使用率的浏览器
        - ios 7
        - Android >= 4.0
    - cascade 美化 默认true 添加前缀后默认右对齐
        > -webkit-transform: rotate(45deg);
         transform: rotate(45deg);
    - remve 是否去掉不必要前缀 默认true

#### gulp-changed
> 用来进行增量构建的插件.通过两种方式进行判断是否更改文件:
> 1)通过最后修改时间(changed.compareLastModifiedTime)这个方式时候静态资源img,font等;
> 2)通过添加sha1加密(changed.compareSha1Digest),这种方式非常适合互相依赖的文件例如:scss,html,js,这写文件经常include其他文件,所以不能使用通过时间判断变化的方式.
> PS: 通过$ state gulpfile.js 命令可以查看gulpfile.js这个文件的信息,包括change时间birth创建时间
- options
    - DEST 传入输出目录  changed插件要拿src里面文件和dest做对比.
    - extension 当文件名编译前后发生变化时,该参数必须传.
    - hasChanged changed.compareLastModifiedTime/changed.compareSha1Digest)

#### gulp-debug
> 可以通过debug查看每次编译的时候有哪些文件通过了流
> PS:通过gulp --verbose命令查看文件的cwd,base,path,stat

- options
    - title 默认gulp-debug

#### minimist
> 是node的命令解析引擎,他可以把命令参数解析成对象,以--做分割符最为对象中的key
> 一般会和process(node中的全局进程对象)中的argv(读取命令行参数)配合使用

````
var minimist = require('minimist');

var argv = minimist(process.argv.slice(2));
var watch = argv.hello;
console.log( process.argv.slice(2));
console.log( minimist(process.argv.slice(2)));
console.log(watch);

````
> 输入命令:✗ node gulpfile.js --hello=watch
> 输出结果依次:
> ['--hellp=watch']
> {_:[],hello:'watch'}
> watch

#### gulp-clean-css
> 进行css的压缩和清理
> 需要注意的是这个插件默认处理IE9及以上的浏览器，需要指定IE兼容版本，否则写的兼容低版本的 IE hack 会被清理掉
> 原插件名gulp-minify-css
> 还有一个需要注意的issue https://github.com/jakubpawlowicz/clean-css/issues/654

- options
    - compatibility: 'ie8'

#### browser-sync
> gul-livereload 也是监听文件变化的工具并能自动刷新,但是browser-sync更强大一些,不仅实现了liverelaodd的所有功能,还可以用于移动端浏览器上,并且可以支持多个浏览器同步操作.

- options
    - proxy 本地web服务 栗子:proxy:'localhost:8003'
    - files 要监听的文件
    - startPath

#### run-sequence
> gulp的task都是异步并行的,如果想要按照顺序执行task,就需要用到run-sequence这个插件了
- options 栗子:runSequence('build','watch',['serve,sass'],cb); 每个参数代表执行的任务,如果参数是数组,说明该数组里的任务是并行的

#### gulp-jade
> 编译jade,从jade官方文档来看,jade有一个编译函数,可以在gulp编译过程中,通过gulp-data这个插件传参到这个编译函数中辅助做一些特殊操作

- options (参数参考jade官方API)
    - pretty 默认false 生成的是压缩以后的html,设置为true以后不会压缩html
    - debug 默认false 改成true以后会输出编译过程

#### gulp-htmlmin
> 压缩html 包括内嵌css js

- options
     - 清除HTML注释removeComments: true
     - 压缩HTML collapseWhitespace: true
     - 省略布尔值 collapseBooleanAttributes: true
     - 删除所有空格作属性值 removeEmptyAttributes: true
     - 压缩页面JS minifyJS: true
     - 压缩页面CSS minifyCSS: tru

#### gulp-uglify
> 压缩js,减少文件大小
- options
    - mangle 是否改变变量名 default:true 可以用来排除混淆变量名 {except: ['require' ,'exports' ,'module' ,'$']}
    - compress 是否完全压缩 default:false
    - preserveComments 是否保留注释 all 全部保留
````
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
        .pipe(gulp.dest(config.scripts.dest))
});
````
#### gulp-jshint
> js错误监控
- options
    - lookup 默认true  false的时候不会查看.jshintrc文件配置  也可以直接在gulpfile.js中定义jshint的相关参数配置jsHintOpt 然后传给jshint(jsHintOpt)
- reporter 错误打印 此处引入jshint-stylish插件高亮显示相关错误

#### gulp-imagemin
> 压缩图片
- options
    - optimizationLevel 优化等级（0-7） 默认3
    - progressive 无损压缩jpg 默认false
    - interlaced 隔行扫描git进行渲染 默认false
    - multipass 多次优化svg 默认false
    - svgoPlugins svg相关配置
        - removeViewBox: false 不移除svg的viewbox属性
    - use 使用imagemin其他插件
        - 使用pingquant深度压缩png图片
- gulp-cache
    - 使用”gulp-cache”只压缩修改的图片，没有修改的图片直接从缓存文件读取

#### gulp-rev-all
> 用来给js css image等文件添加md5
- options
    - fileNameVersion,fileNameManifest生成映射json文件
    - dontGlobal 不需要关联处理的文件 栗子:seo相关的robots.txt文件
    - dontRenameFile 不需要重命名的文件
    - dontUpdateReference 不需要更新引用的文件
    - hashLength 默认hash长度是8
    - prefix 给文件添加完整的url路径
    - debug
    - Annotator 和 Replacer这两个参数用可以组合解决文件名和文件定义的模块/或者文件种请求地址一致时把模块或者请求地址添加上版本号的问题.https://github.com/smysnk/gulp-rev-all/issues/106
- methods
    - revision() 添加后缀的函数
    - manifestFile() 生成rev-manifest.json映射
    - versionFile() 生成 rev-version.json映射




