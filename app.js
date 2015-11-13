'use strict'

function initImgWapper (body) {
    var div = document.createElement('div')
    div.id = 'img-wapper'
    body.appendChild(div)
    return div
}

function getMetaInfo (isPrint) {
    var head = document.getElementsByTagName('head')[0]
    var childNodes = head.childNodes
    var meta = {}
    Array.prototype.forEach.call(head.children, function (child) {
        var name = child.getAttribute('name')
        if (child.nodeName === 'TITLE') {
            meta.title = child.innerText
            return
        }
        if (name === null || name === "" || name === undefined) return
        meta[name] = child.getAttribute('content')
    })
    for (var i = 0, max = childNodes.length; i < max; i++) {
        var cn = childNodes[i]
        if (cn.nodeName !== '#comment') continue
        // TODO: maybe here will wrong
        meta.generatedTime = cn.data.slice(1,-1) // remove the blank symbol
        break
    }

    if (isPrint === true) {
        // Print the Article's meta information
        console.log('Article\'s Meta')
        Array.prototype.forEach.call(Object.keys(meta), function (name) {
            console.log(name.toUpperCase() + ': ' + meta[name])
        })
    }

    return meta
}

function showBanner (body, content) {
    var div = document.createElement('div')
    div.id = 'banner-wrapper'
    Array.prototype.forEach.call(['e', 'i&#960;', '+', '1', '=', '0'], function(s, index) {
        var tag
        if (index === 1) {
            tag = document.createElement('sup')
        } else {
            tag = document.createElement('span')            
        }
        tag.innerHTML = s
        div.appendChild(tag)
    })
    body.insertBefore(div, content)

    content.getElementsByClassName('title')[0].style.display = 'none'
}

function showHomeButton (body) {
    var div = document.createElement('div')
    var a = document.createElement('a')
    var img = document.createElement('img')
    div.id = "avatar-wapper"
    a.href = '/'
    a.alt = 'Return'
    img.src = '/static/avatar.png'
    img.alt = 'Return'
    div.appendChild(a)
    a.appendChild(img)
    body.appendChild(div)
}

function showFooter (body, meta) {
    // TODO: change the email
    var footer = document.createElement('footer')
    footer.innerHTML =
        '<p><a href="http://creativecommons.org/licenses/by-nc-sa/3.0/cn/">Attribution-NonCommercial-ShareAlike 3.0 China Mainland</a></p>' +
        '<p>Author is <a href="mailto:creamidea@gmail.com">'+
        (meta.author || 'Unknow') +
        '</a>. Edited by <a href="http://www.gnu.org/software/emacs/">Emacs</a>. Generated by <a href="http://orgmode.org/">Org-mode</a>. Hosted by <a href="https://github.com/">Github</a>.</p>'
    body.appendChild(footer)
}

function showTags (body, content, meta) {
    if (!meta.keywords) return
    var keywords = meta.keywords.split(' ')
    if (keywords && keywords.length > 0) {
        var div = document.createElement('div')
        var footnotes = document.getElementById('footnotes')
        var searchEngine = 'https://g.forestgump.me/?gws_rd=ssl#q='
        keywords.forEach(function (key) {
            var a = document.createElement('a')
            a.href = searchEngine +
                key + '+site:' + window.location.hostname
            a.title = 'Go to ' + key
            a.innerText = key
            div.appendChild(a)
        })
        div.id = 'tags'
        content.insertBefore(div, footnotes)
    }
}

function ImgClickEvent (body, wapper) {

    function fun (e) {
        var img = wapper.getElementsByTagName('img')
        var target = e.target
        if (target.nodeName === 'IMG' || target.id === 'img-wapper') {
            if (img.length > 0 || target.id === 'img-wapper') {
                // hide image
                wapper.style.opacity = 0
                body.style.overflow = null
                setTimeout(function(){
                    for (var i = 0, max = img.length; i < max; i++) {
                        img[i].style.transform = 'scale(1.25977) translateZ(0)'
                        wapper.removeChild(img[i])
                    }
                    wapper.style.display = 'none'
                }, 100)
            } else if (img.length === 0) {
                // show image
                var img = document.createElement('img')
                img.src = e.target.src
                wapper.appendChild(img)
                wapper.style.display = 'block'
                setTimeout(function () {
                    wapper.style.opacity = 1
                    img.style.transform = 'scale(1.25977) translateZ(0)'
                    
                }, 100)
                body.style.overflow = 'hidden'
            }
        }
    }

    if (window.attachEvent) 
        body.attachEvent('click', fun);  //IE浏览器
    else
        body.addEventListener('click', fun, false);  //非IE浏览器
}

function someHomeFix (body, content) {

    var orgUl = document.getElementsByClassName('org-ul')[0]
    orgUl.style.listStyleType = 'lower-greek'

    document.getElementById('org-div-home-and-up').style.display = 'none'
}

function someArticleFix (body, content) {
    
}

function loadDisqus(body, content) {
    var div = document.createElement('div')
    div.className = 'comm'
    div.innerHTML = '<div class="comm_open_btn" comment="copy from bilibili.com :P" onclick="loadDisqusComment(this)"></div>'
    content.appendChild(div)
}
function loadDisqusComment (target) {
    var parent = target.parentElement
    parent.style.display = 'none'
    
    var d = document
    var s = document.createElement('script')
    s.src = '//creamidea.disqus.com/embed.js'
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    
    var content = document.getElementById('content')
    var disqus = document.createElement('div')
    disqus.id = 'outline_disqus_thread'
    disqus.className = 'outline-2'
    disqus.style.marginBottom = '44px'
    disqus.innerHTML = '<h2 id="disqus_thread_header">Comments</h2><div id="disqus_thread"></div>'
    content.appendChild(disqus)
}
function disqus_config () {
    // 这里是配置disqus地方，具体可以参考
    // https://help.disqus.com/customer/portal/articles/472098-javascript-configuration-variables
}

window.onload = function () {
    var pathname = window.location.pathname
    var body = document.getElementsByTagName('body')[0]
    var content = document.getElementById('content')
    var meta = getMetaInfo(true)

    showTags(body, content, meta)
    if (pathname === '/') {
        someHomeFix(body, content)
        showBanner(body, content)
    } else {
        // showHomeButton(body)
        ImgClickEvent(body, initImgWapper(body, content))
        someArticleFix(body, content)
        loadDisqus(body, content)
    }
    showFooter(body, content, meta)

}
