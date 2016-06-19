
var url = window.location.href
var params = util.urlParser(url);
var urlfor = params.search.for; //兼容之前的for，一周以后去掉
var urlpkg = params.search.pkg;
var urlpage = params.search.page;
var urlFromlocal = params.search.fromlocal;
var classParams = {
    "baobao": "baobao",
    "fuzhuang": "fuzhuang",
    "meizhuang": "meizhuang",
    "uc-cloth": "uc-cloth",
    "uc-caizhuang":"uc-caizhuang",
    "uc-kouhong":"uc-kouhong"
};


var $downloadBtn, $moreBtn, $download, $mask,$mainOld,$mainNew,$swiperSlide,$angleDoubleDown;


var _view = {
    init: function() {
        if (urlFromlocal && urlFromlocal === 'wbfans') {
            $moreBtn.addClass('hide');
        }
        if (util.device.isPhone) {
            if (/baidusem|sina_news/i.test(urlfor) || /baidusem|sina_news/i.test(urlpkg)) {
                am.toAppMarket();
            } else if (urlfor === "baidupz" || urlpkg === "baidupz") {
                setTimeout(function() {
                    am.toAppMarket();
                }, 3000);
            }
        }
        if (urlpage) {
            if(/(uc-)/i.test(urlpage)){
                $swiperSlide.addClass('hide');
                $angleDoubleDown.addClass('hide');
                $download.addClass('uc-com');
                $download.addClass(classParams[urlpage]);
            }else{
                $download.addClass(classParams[urlpage]);
                $download.removeClass('download-new');
                $mainNew.addClass("hide");
                $mainOld.removeClass("hide");
            }

        }
        _view.initSwiper();
    },
    initSwiper: function() {
        var swiper;
        swiper = new Swiper('.swiper-container', {
            direction: 'vertical'
        });
    }
};

var _event = {
    bind: function() {
        $downloadBtn.on("click", _event.handleDownload);
        $moreBtn.on("click", _event.handleMore);
        // 点击弹出遮罩层隐藏
        $mask.off().on('click', function() {
            $(this).hide();
        });
        //uc推广渠道body调起appStore
        if(urlpage && /(uc-)/i.test(urlpage)){
            $("body").on("click",_event.handleDownload);
        }
    },
    handleDownload: function() {
        if (!util.device.isPhone) {
            alert("电脑用户请用手机下载");
            return false;
        }
        //微博下载提示浏览器打开
        //if(util.device.isWeibo ){
        //    $mask.show();
        //    return false;
        //}
        am.toAppMarket();
        //am.evokeAppPage(confUrl.amScheme.tab, {index:0});
    },
    handleMore: function() {
        var searchParams = params.search;
        var str = "";
        var ref = params.pathname.split("/").reverse()[0].split(".html")[0];
        delete searchParams.ref;
        searchParams.ref = ref;
        str = params.protocol + "//" + params.host + "/index.html" + '?' + $.param(searchParams);
        window.location = str;
    }
};

function init() {
    xxx
    $downloadBtn = $(".j-download-btn");
    $moreBtn = $("#j-more-btn");
    $download = $('#j-download');
    $mask = $("#j-mask");
    $mainOld = $("#j-main-old");
    $mainNew = $("#j-main-new");
    $swiperSlide = $(".j-swiper-slide");
    $angleDoubleDown = $(".j-angle-double-down");
    _view.init();
    _event.bind();

}

$(document).ready(function() {
    init();
});
