#scss文件中重复引用一个文件,只编译一次,如果特殊情况下必须引入俩个完全相同的文件,并且希望编译输出2次,则在引入的第二个文件后面添加!,例如@import "test!"
require 'compass/import-once/activate'

#项目文件目录配置
http_path = '/'                 #项目根目录
project_path = 'src/public'     #项目目录
css_dir = 'css'                 #css文件放在css下
sass_dir = 'sass'               #sass文件放在scss文件夹下
image_dir = 'img'               #image文件放在img下
font_dir = 'font'               #font 文件放在font下

#是否生成缓存文件
cache = false;

#浏览器调试scss,chrome浏览器设置:setting里面找到soure,选中Enable css source maps 和Auto-reload generated css
sourcemap = true;

#out_style 有4种格式:expanded 输出后保持原格式 :nested :compact :compressed 压缩格式
out_style =:compressed;

#相对路径 纠正compass sprite图片路径
#relative_assets = true;

#取消注释
line_comments = false;
