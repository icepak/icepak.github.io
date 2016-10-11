"use strict"

// Router Interface
function Router (routes) {
  var _router
  function compile (r) {
    if (r) {

    } else {
      _router = Object.keys(routes).map(function (r) {
        return {
          test: new RegExp(r, 'i'),
          cb: routes[r]
        }
      })
    }
  }

  compile()

  return {
    test: function () {
      // testing...
      var rlts = _router.map(function (r) {
        if (r.test.test(location.hash)) {
          console.log('Router hited the target: ' + r.test.toString() + '. Go, Go, Go!')
          r.cb.apply(r, r.test.exec(location.hash).slice(1))
          return true
        }
        return false
      })
      if (rlts.indexOf(true) < 0) console.log('Router cannot find the target: ' + location.hash + '.')
    }
  }
}

// toggle the stage
function Stage () {

  var head = document.querySelector('head')
  var title = head.querySelector('title')
  var body = document.querySelector('body')
  var nav = document.querySelector('nav')
  var archive = document.querySelector('#archive')
  var article = document.querySelector('#article')
  var banner = showBanner(body, nav)
  var btnReturn = document.createElement('a')
  var cache = {}

  var __interface = {
    init: function (ready) {
      // load archive (articles list)
      console.log('Stage initializing...')
      loadArchive(body, function (articleList, specialList) {
        cache.articleList = articleList
        var archive = nav.appendChild(createNavDom({
          text: 'Archive',
          onclick: function (e) {
            e.preventDefault()
            var url = '#!/archive'
            location.hash = url
          }}))

        __map.call(specialList.children, function (item) {
          var t = item.querySelector('.title')
          var name = t.innerHTML
          if (['friends', 'works'].indexOf(name) >= 0) {
            nav.appendChild(createNavDom({
              href:'#!'+t.getAttribute('href'), text: name
            }))
          }
        })

        console.log('Stage initialized finished.\nCall function::ready...')
        if (typeof ready === 'function') ready()
        console.log('Function::ready done.')
      })
    },
    show: function (drama) {
      console.log('Now, the drama is ' + drama)
      try {
        this[drama]()
      } catch (err) {
        console.log(err)
      }
    },
    archive: function () {
      // show archive-list
      if (archive.innerHTML === '') {
        var articleList = cache.articleList
        // btnReturn.innerHTML = 'Return'
        btnReturn.onclick = function (e) {
          e.preventDefault()
          location.href = '#!/home'
          // __interface.hide()
        }
        body.appendChild(btnReturn)
        archive.appendChild(articleList)

        articleList.addEventListener('click', function (ev) {
          ev.preventDefault()
          var target = ev.target
          var href = target.href
          var host = window.location.host;

          if (window.console && window.console.info) {
            console.info('navigator: ' + href)
          }
          pjax({url: href})
          // if (href.indexOf(host) > -1 && href.indexOf('#') == -1 && !/^\/(ST|tools)/i.test(location.pathname) && !$(this).parent('#indexLogo').size() && !/\.(jpg|jpeg|png|gif|js|css|woff|ttf)(\?.*)?$/.test(href) && !evt.metaKey && !evt.ctrlKey) {
          //   evt.preventDefault();
          // }
        })
      }

      // hide others
      nav.className="bounceOut animated"
      banner.className="bounceOut animated"

      // show archives
      archive.style.display = "block"
      btnReturn.style.display = "block"
      archive.className = 'bounceInUp animated'
      btnReturn.className = 'return bounceInUp animated'

      // change body backgroundcolor
      body.style.background = '#fafafa'
    },
    hide: function () {
      // change body backgroundcolor
      body.style.background = ''

      // show others
      nav.className="bounceIn animated"
      banner.className="bounceIn animated"

      // hide archives
      archive.className = 'bounceOutDown animated'
      btnReturn.className = 'return bounceOutDown animated'

      setTimeout(function () {
        archive.style.display = "none"
        btnReturn.style.display = "none"
      }, 1000)
    },
    render: function (url) {
      pjax({
        url: url,
        success: function (page) {
          var html = article.contentDocument.querySelector('html')
          html.replaceChild(page.head, html.querySelector('head'))
          html.replaceChild(page.body, html.querySelector('body'))
        }
      })
    }
  }
  return __interface
}

var __map = Array.prototype.map
var __forEach = Array.prototype.forEach
// var __pop = Array.prototype.pop
var __shift = Array.prototype.shift
var parser = new DOMParser()
var pageCache = window.pageCache = window.pageCache || {};
var archiveCache = window.archiveCache = window.archiveCache || {};
var basepath = location.pathname
var STORAGEPREFIX = 'https://media.githubusercontent.com/media/creamidea/creamidea.github.com/master/'

/**
 * 变换首页octocat图片 本地预处理(提前加载到本地缓存中)
 */
function changeOctoCat (body) {
  var s = document.createElement('script');
  s.src = '/static/octodex-data.js';
  s.onload = function () {
    var octodex = window.octodex;
    if (!octodex) return;
    var max = octodex.length;
    var octocat = octodex[Math.round(Math.random(max) * 10000 % max)];
    if (!octocat.src) {
      console.log('Now, I want to load ', octocat, '. But failed!');
      return;
    }
    var src = 'https://octodex.github.com' + octocat.src;
    var img = document.createElement('img');
    img.style.display = 'none';
    img.src = src;
    img.onload = function () {
      var oBannerWrapper = document.getElementById('banner-wrapper');
      if (!oBannerWrapper) return
      // oBannerWrapper.style.background = 'url('+ src +') no-repeat top center fixed';
      // oBannerWrapper.style.backgroundSize = '424px 424px';
      oBannerWrapper.style.textAlign = 'center';
      oBannerWrapper.innerHTML = '<img src="'+src+'" alt="'+octocat.title+'"/><p style="display: block;margin:0;bottom:0;left:1%;right:1%;line-height:1;"><a href="https://github.com/" alt="Check me out on :octocat:" title="Check me out on :octocat:" style="color:black;font-size:16px;font-family:Georgia1,Georgia,Times New Roman,Times,serif;font-style: italic;">'+octocat.title+'</a></p>';
      clearInterval(window.blinkTimer);
    };
    img.onerror = function () {
      console.log('Load the image of octocat failed!');
      clearInterval(window.blinkTimer);
    };
    body.appendChild(img);
  };
  body.appendChild(s);
}

/**
 * 闪烁 >_
 */
function blink () {
  __forEach.call(document.getElementsByClassName('blink'), function (blink) {
    var oldColor = blink.getAttribute('data-old-color');
    if (!oldColor)
      blink.setAttribute('data-old-color', blink.style.color);
    var frequency = parseInt(blink.getAttribute('data-frequency'), 10);
    if (frequency > 0)
      window.blinkTimer = setInterval(function(_blink, _oldColor) {
        if (!_blink) _blink = blink;
        if (!_oldColor) _oldColor = oldColor;
        if (blink)
          blink.style.color = blink.style.color === 'white' ? oldColor : 'white';
      }, frequency, blink, oldColor);
  });
}

/**
 * 增加首页背景图片的容器
 */
function showBanner (body, content) {
  var div = document.createElement('div');
  div.id = 'banner-wrapper';
  div.innerHTML = '<p style="text-align: center;font-size: 14em; margin: 0;">&gt;<span class="blink" data-frequency="700">_</span></p>';
  body.insertBefore(div, content);
  blink()
  changeOctoCat(body);
  return div
}

/**
 * 初始化首页banner图片
 */
// function initImgWapper (body) {
//   var div = document.createElement('div');
//   div.id = 'img-wapper';
//   body.appendChild(div);
//   return div;
// }

/**
 * Just support method:GET
 */
function loader(o) {
  const httpRequest = new XMLHttpRequest()
  if (!httpRequest) {
    console.error('Giving up :( Cannot create an XMLHTTP instance');
    return false;
  }
  httpRequest.onreadystatechange = function () {
    try {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          if (typeof o.success === 'function') o.success(httpRequest.responseText)
        } else {
          if (typeof o.fail === 'function') o.fail(httpRequest)
        }
      }
    }
    catch( e ) {
      if (typeof o.error === 'function') o.error(httpRequest, e)
      console.error(e)
    }
  }
  httpRequest.open(o.type, o.url)
  httpRequest.send()
}

function loadArchive (body, callback) {
  loader({
    type: 'GET',
    url: '/static/html/archive.html',
    success: function (txt) {
      var htmlDoc = parser.parseFromString(txt, "text/html")
      callback(
        htmlDoc.querySelector('.article-list'),
        htmlDoc.querySelector('.special-list')
      )
    }
  })
}

function createNavDom (o) {
  var a = document.createElement('a')
  a.href = o.href
  a.innerHTML = o.text
  a.onclick = o.onclick
  return a
}

function pjax(o) {
  var url = o.url
  var tag = o.tag
  // var _url = new URL(url)
  // var pathname = _url.pathname
  // var newURL = location.protocol + '//' + location.hostname + ':' + location.port + pathname
  // if (!tag) {
  //   history.pushState({
  //     url: newURL
  //   }, '', newURL);
  // }
  if (pageCache[url]) {
    return render(pageCache[url]);
  }
  // var loadLayer = '<div id="loadLayer" style="position:fixed;left:0;right:0;top:0;bottom:0;background:rgba(255,255,255,0.8);text-align:center;line-height:400px;font-size:30px;z-index:82;display:none;">' + '玩命加载中...' + '</div>';
  // $(loadLayer).appendTo($('html')).fadeIn(300);
  loader({
    type: 'GET',
    url: url,
    success: function (txt) {
      var htmlDoc = parser.parseFromString(txt, "text/html")
      try {
        var head = htmlDoc.querySelector('head')
        var title = head.querySelector('title')
        var body = htmlDoc.querySelector('body')
      } catch (e) {
        window.location.href = url;
        return;
      }
      pageCache[url] = {
        title: title.innerHTML,
        head: head,
        body: body
      };
      if (typeof o.success === 'function') o.success(pageCache[url])
      // render(pageCache[url]);
    },
    fail: function() {
      // window.location.href = url;
      debugger
    }
  })
}

function render(data) {
  var html = document.querySelector('html')
  var title = data.title
  var newHead = data.head
  var newBody = data.body
  //  html.replaceChild(newHead, document.querySelector('head'))
  //  html.replaceChild(newBody, document.querySelector('body'))
  // console.log(html, title, newHead, newBody)
  document.querySelector('body').innerHTML = newBody
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
  // $('#loadLayer').remove();
  // window.dispatchEvent(new Event('load'))
}

function init () {

  var stage = Stage()
  var router = Router({
    "home": function () {
      stage.hide()
    },
    "archive": function () {
      stage.show('archive')
    },
    "wiki/(\.+)": function () {
      var file = __shift.call(arguments)
      var url = STORAGEPREFIX + 'static/html/wiki/' + file
      stage.render(url)
      // pjax({url: url})
    },
    "article/(\.+)": function () {
      var file = __shift.call(arguments)
      var url = STORAGEPREFIX + 'static/html/article/' + file
      stage.render(url)
      // pjax({url: url})
    }
  })

    // pageCache['/'] = {
    //   title: title.innerHTML,
    //   head: head.innerHTML,
    //   body: body.innerHTML
    // }
  stage.init(router.test)
  window.onhashchange = function () {
    // code
    // console.log(arguments, this)
    router.test()
  }

}

window.onpopstate = function () {
  var currentState = history.state
  console.log(currentState)
  if (currentState) {
    if (window.console && window.console.info) {
      console.info('navigator back: ' + currentState.url)
    }
    // pjax({url:currentState.url, tag: 'Go'})
  } else {
    // render(pageCache['/'])
  }
}
window.onload = function () {
  init()
  // if (location.pathname === '/')
}
