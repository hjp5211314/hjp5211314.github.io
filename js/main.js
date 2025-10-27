document.addEventListener('DOMContentLoaded', () => {
  let headerContentWidth, $nav
  let mobileSidebarOpen = false

  const adjustMenu = init => {
    const getAllWidth = ele => Array.from(ele).reduce((width, i) => width + i.offsetWidth, 0)

    if (init) {
      const blogInfoWidth = getAllWidth(document.querySelector('#blog-info > a').children)
      const menusWidth = getAllWidth(document.getElementById('menus').children)
      headerContentWidth = blogInfoWidth + menusWidth
      $nav = document.getElementById('nav')
    }

    const hideMenuIndex = window.innerWidth <= 768 || headerContentWidth > $nav.offsetWidth - 120
    $nav.classList.toggle('hide-menu', hideMenuIndex)
  }

  // 初始化header
  const initAdjust = () => {
    adjustMenu(true)
    $nav.classList.add('show')
  }

  // sidebar menus
  const sidebarFn = {
    open: () => {
      btf.overflowPaddingR.add()
      btf.animateIn(document.getElementById('menu-mask'), 'to_show 0.5s')
      document.getElementById('sidebar-menus').classList.add('open')
      mobileSidebarOpen = true
    },
    close: () => {
      btf.overflowPaddingR.remove()
      btf.animateOut(document.getElementById('menu-mask'), 'to_hide 0.5s')
      document.getElementById('sidebar-menus').classList.remove('open')
      mobileSidebarOpen = false
    }
  }

  /**
   * 首頁top_img底下的箭頭
   */
  const scrollDownInIndex = () => {
    const handleScrollToDest = () => {
      const pageHeader = document.getElementById('page-header')
      const contentInner = document.getElementById('content-inner')
      // 计算目标位置：content-inner的顶部位置
      const targetPos = contentInner.offsetTop
      // 考虑导航栏高度，确保内容刚好在导航栏下方
      btf.scrollToDest(targetPos, 300)
    }

    const $scrollDownEle = document.getElementById('scroll-down')
    $scrollDownEle && btf.addEventListenerPjax($scrollDownEle, 'click', handleScrollToDest)
  }

  /**
   * 代碼
   * 只適用於Hexo默認的代碼渲染
   */
  const addHighlightTool = () => {
    const highLight = GLOBAL_CONFIG.highlight
    if (!highLight) return

    const { highlightCopy, highlightLang, highlightHeightLimit, highlightFullpage, highlightMacStyle, plugin } = highLight
    const isHighlightShrink = GLOBAL_CONFIG_SITE.isHighlightShrink
    const isShowTool = highlightCopy || highlightLang || isHighlightShrink !== undefined || highlightFullpage || highlightMacStyle
    const $figureHighlight = plugin === 'highlight.js' ? document.querySelectorAll('figure.highlight') : document.querySelectorAll('pre[class*="language-"]')

    if (!((isShowTool || highlightHeightLimit) && $figureHighlight.length)) return

    const isPrismjs = plugin === 'prismjs'
    const highlightShrinkClass = isHighlightShrink === true ? 'closed' : ''
    const highlightShrinkEle = isHighlightShrink !== undefined ? '<i class="fas fa-angle-down expand"></i>' : ''
    const highlightCopyEle = highlightCopy ? '<div class="copy-notice"></div><i class="fas fa-paste copy-button"></i>' : ''
    const highlightMacStyleEle = '<div class="macStyle"><div class="mac-close"></div><div class="mac-minimize"></div><div class="mac-maximize"></div></div>'
    const highlightFullpageEle = highlightFullpage ? '<i class="fa-solid fa-up-right-and-down-left-from-center fullpage-button"></i>' : ''

    const alertInfo = (ele, text) => {
      if (GLOBAL_CONFIG.Snackbar !== undefined) {
        btf.snackbarShow(text)
      } else {
        ele.textContent = text
        ele.style.opacity = 1
        setTimeout(() => { ele.style.opacity = 0 }, 800)
      }
    }

    const copy = async (text, ctx) => {
      try {
        await navigator.clipboard.writeText(text)
        alertInfo(ctx, GLOBAL_CONFIG.copy.success)
      } catch (err) {
        console.error('Failed to copy: ', err)
        alertInfo(ctx, GLOBAL_CONFIG.copy.noSupport)
      }
    }

    // click events
    const highlightCopyFn = (ele, clickEle) => {
      const $buttonParent = ele.parentNode
      $buttonParent.classList.add('copy-true')
      const preCodeSelector = isPrismjs ? 'pre code' : 'table .code pre'
      const codeElement = $buttonParent.querySelector(preCodeSelector)
      if (!codeElement) return
      copy(codeElement.innerText, clickEle.previousElementSibling)
      $buttonParent.classList.remove('copy-true')
    }

    const highlightShrinkFn = ele => ele.classList.toggle('closed')

    const codeFullpage = (item, clickEle) => {
      const wrapEle = item.closest('figure.highlight')
      const isFullpage = wrapEle.classList.toggle('code-fullpage')

      document.body.style.overflow = isFullpage ? 'hidden' : ''
      clickEle.classList.toggle('fa-down-left-and-up-right-to-center', isFullpage)
      clickEle.classList.toggle('fa-up-right-and-down-left-from-center', !isFullpage)
    }

    const highlightToolsFn = e => {
      const $target = e.target.classList
      const currentElement = e.currentTarget
      if ($target.contains('expand')) highlightShrinkFn(currentElement)
      else if ($target.contains('copy-button')) highlightCopyFn(currentElement, e.target)
      else if ($target.contains('fullpage-button')) codeFullpage(currentElement, e.target)
    }

    const expandCode = e => e.currentTarget.classList.toggle('expand-done')

    // 獲取隱藏狀態下元素的真實高度
    const getActualHeight = item => {
      const hiddenElements = new Map()

      const fix = () => {
        let current = item
        while (current !== document.body && current != null) {
          if (window.getComputedStyle(current).display === 'none') {
            hiddenElements.set(current, current.getAttribute('style') || '')
          }
          current = current.parentNode
        }

        const style = 'visibility: hidden !important; display: block !important;'
        hiddenElements.forEach((originalStyle, elem) => {
          elem.setAttribute('style', originalStyle ? originalStyle + ';' + style : style)
        })
      }

      const restore = () => {
        hiddenElements.forEach((originalStyle, elem) => {
          if (originalStyle === '') elem.removeAttribute('style')
          else elem.setAttribute('style', originalStyle)
        })
      }

      fix()
      const height = item.offsetHeight
      restore()
      return height
    }

    const createEle = (lang, item) => {
      const fragment = document.createDocumentFragment()

      if (isShowTool) {
        const hlTools = document.createElement('div')
        hlTools.className = `highlight-tools ${highlightShrinkClass}`
        hlTools.innerHTML = highlightMacStyleEle + highlightShrinkEle + lang + highlightCopyEle + highlightFullpageEle
        btf.addEventListenerPjax(hlTools, 'click', highlightToolsFn)
        fragment.appendChild(hlTools)
      }

      if (highlightHeightLimit && getActualHeight(item) > highlightHeightLimit + 30) {
        const ele = document.createElement('div')
        ele.className = 'code-expand-btn'
        ele.innerHTML = '<i class="fas fa-angle-double-down"></i>'
        btf.addEventListenerPjax(ele, 'click', expandCode)
        fragment.appendChild(ele)
      }

      isPrismjs ? item.parentNode.insertBefore(fragment, item) : item.insertBefore(fragment, item.firstChild)
    }

    $figureHighlight.forEach(item => {
      let langName = ''
      if (isPrismjs) btf.wrap(item, 'figure', { class: 'highlight' })

      if (!highlightLang) {
        createEle('', item)
        return
      }

      if (isPrismjs) {
        langName = item.getAttribute('data-language') || 'Code'
      } else {
        langName = item.getAttribute('class').split(' ')[1]
        if (langName === 'plain' || langName === undefined) langName = 'Code'
      }
      createEle(`<div class="code-lang">${langName}</div>`, item)
    })
  }

  /**
   * PhotoFigcaption
   */
  const addPhotoFigcaption = () => {
    if (!GLOBAL_CONFIG.isPhotoFigcaption) return
    document.querySelectorAll('#article-container img').forEach(item => {
      const altValue = item.title || item.alt
      if (!altValue) return
      const ele = document.createElement('div')
      ele.className = 'img-alt text-center'
      ele.textContent = altValue
      item.insertAdjacentElement('afterend', ele)
    })
  }

  /**
   * Lightbox
   */
  const runLightbox = () => {
    btf.loadLightbox(document.querySelectorAll('#article-container img:not(.no-lightbox)'))
  }

  /**
   * justified-gallery 圖庫排版
   */

  const fetchUrl = async url => {
    try {
      const response = await fetch(url)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch URL:', error)
      return []
    }
  }

  const runJustifiedGallery = (container, data, config) => {
    const { isButton, limit, firstLimit, tabs } = config

    const dataLength = data.length
    const maxGroupKey = Math.ceil((dataLength - firstLimit) / limit + 1)

    // Gallery configuration
    const igConfig = {
      gap: 5,
      isConstantSize: true,
      sizeRange: [150, 600],
      // useResizeObserver: true,
      // observeChildren: true,
      useTransform: true
      // useRecycle: false
    }

    const ig = new InfiniteGrid.JustifiedInfiniteGrid(container, igConfig)
    let isLayoutHidden = false

    // Utility functions
    const sanitizeString = str => (str && str.replace(/"/g, '&quot;')) || ''

    const createImageItem = item => {
      const alt = item.alt ? `alt="${sanitizeString(item.alt)}"` : ''
      const title = item.title ? `title="${sanitizeString(item.title)}"` : ''
      return `<div class="item">
        <img src="${item.url}" data-grid-maintained-target="true" ${alt} ${title} />
      </div>`
    }

    const getItems = (nextGroupKey, count, isFirst = false) => {
      const startIndex = isFirst ? (nextGroupKey - 1) * count : (nextGroupKey - 2) * count + firstLimit
      return data.slice(startIndex, startIndex + count).map(createImageItem)
    }

    // Load more button
    const addLoadMoreButton = container => {
      const button = document.createElement('button')
      button.innerHTML = `${GLOBAL_CONFIG.infinitegrid.buttonText}<i class="fa-solid fa-arrow-down"></i>`

      button.addEventListener('click', () => {
        button.remove()
        btf.setLoading.add(container)
        appendItems(ig.getGroups().length + 1, limit)
      }, { once: true })

      container.insertAdjacentElement('afterend', button)
    }

    const appendItems = (nextGroupKey, count, isFirst) => {
      ig.append(getItems(nextGroupKey, count, isFirst), nextGroupKey)
    }

    // Event handlers
    const handleRenderComplete = e => {
      if (tabs) {
        const parentNode = container.parentNode
        if (isLayoutHidden) {
          parentNode.style.visibility = 'visible'
        }
        if (container.offsetHeight === 0) {
          parentNode.style.visibility = 'hidden'
          isLayoutHidden = true
        }
      }

      const { updated, isResize, mounted } = e
      if (!updated.length || !mounted.length || isResize) return

      btf.loadLightbox(container.querySelectorAll('img:not(.medium-zoom-image)'))

      if (ig.getGroups().length === maxGroupKey) {
        btf.setLoading.remove(container)
        !tabs && ig.off('renderComplete', handleRenderComplete)
        return
      }

      if (isButton) {
        btf.setLoading.remove(container)
        addLoadMoreButton(container)
      }
    }

    const handleRequestAppend = btf.debounce(e => {
      const nextGroupKey = (+e.groupKey || 0) + 1

      if (nextGroupKey === 1) appendItems(nextGroupKey, firstLimit, true)
      else appendItems(nextGroupKey, limit)

      if (nextGroupKey === maxGroupKey) ig.off('requestAppend', handleRequestAppend)
    }, 300)

    btf.setLoading.add(container)
    ig.on('renderComplete', handleRenderComplete)

    if (isButton) {
      appendItems(1, firstLimit, true)
    } else {
      ig.on('requestAppend', handleRequestAppend)
      ig.renderItems()
    }

    btf.addGlobalFn('pjaxSendOnce', () => ig.destroy())
  }

  const addJustifiedGallery = async (elements, tabs = false) => {
    if (!elements.length) return

    const initGallery = async () => {
      for (const element of elements) {
        if (btf.isHidden(element) || element.classList.contains('loaded')) continue

        const config = {
          isButton: element.getAttribute('data-button') === 'true',
          limit: parseInt(element.getAttribute('data-limit'), 10),
          firstLimit: parseInt(element.getAttribute('data-first'), 10),
          tabs
        }

        const container = element.firstElementChild
        const content = container.textContent
        container.textContent = ''
        element.classList.add('loaded')

        try {
          const data = element.getAttribute('data-type') === 'url' ? await fetchUrl(content) : JSON.parse(content)
          runJustifiedGallery(container, data, config)
        } catch (error) {
          console.error('Gallery data parsing failed:', error)
        }
      }
    }

    if (typeof InfiniteGrid === 'function') {
      await initGallery()
    } else {
      await btf.getScript(GLOBAL_CONFIG.infinitegrid.js)
      await initGallery()
    }
  }

  /**
   * rightside scroll percent
   */
  const rightsideScrollPercent = currentTop => {
    const scrollPercent = btf.getScrollPercent(currentTop, document.body)
    const goUpElement = document.getElementById('go-up')

    if (scrollPercent < 95) {
      goUpElement.classList.add('show-percent')
      goUpElement.querySelector('.scroll-percent').textContent = scrollPercent
    } else {
      goUpElement.classList.remove('show-percent')
    }
  }

  /**
   * 滾動處理
   */
  const scrollFn = () => {
    const $rightside = document.getElementById('rightside')
    const innerHeight = window.innerHeight + 56
    let initTop = 0
    const $header = document.getElementById('page-header')
    const isChatBtn = typeof chatBtn !== 'undefined'
    const isShowPercent = GLOBAL_CONFIG.percent.rightside

    // 檢查文檔高度是否小於視窗高度
    const checkDocumentHeight = () => {
      if (document.body.scrollHeight <= innerHeight) {
        $rightside.classList.add('rightside-show')
        return true
      }
      return false
    }

    // 如果文檔高度小於視窗高度,直接返回
    if (checkDocumentHeight()) return

    // find the scroll direction
    const scrollDirection = currentTop => {
      const result = currentTop > initTop // true is down & false is up
      initTop = currentTop
      return result
    }

    let flag = ''
    const scrollTask = btf.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop
      const isDown = scrollDirection(currentTop)
      if (currentTop > 56) {
        if (flag === '') {
          $header.classList.add('nav-fixed')
          $rightside.classList.add('rightside-show')
        }

        if (isDown) {
          if (flag !== 'down') {
            $header.classList.remove('nav-visible')
            isChatBtn && window.chatBtn.hide()
            flag = 'down'
          }
        } else {
          if (flag !== 'up') {
            $header.classList.add('nav-visible')
            isChatBtn && window.chatBtn.show()
            flag = 'up'
          }
        }
      } else {
        flag = ''
        if (currentTop === 0) {
          $header.classList.remove('nav-fixed', 'nav-visible')
        }
        $rightside.classList.remove('rightside-show')
      }

      isShowPercent && rightsideScrollPercent(currentTop)
      checkDocumentHeight()
    }, 300)

    btf.addEventListenerPjax(window, 'scroll', scrollTask, { passive: true })
    
    // 页面加载时立即检查滚动位置，处理刷新后恢复滚动位置的情况
    const initScrollTop = window.scrollY || document.documentElement.scrollTop
    if (initScrollTop > 56) {
      $header.classList.add('nav-fixed', 'nav-visible')
      $rightside.classList.add('rightside-show')
      flag = 'up'
    }
  }

  /**
  * toc,anchor
  */
  const scrollFnToDo = () => {
    const isToc = GLOBAL_CONFIG_SITE.isToc
    const isAnchor = GLOBAL_CONFIG.isAnchor
    const $article = document.getElementById('article-container')

    if (!($article && (isToc || isAnchor))) return

    let $tocLink, $cardToc, autoScrollToc, $tocPercentage, isExpand

    if (isToc) {
      const $cardTocLayout = document.getElementById('card-toc')
      $cardToc = $cardTocLayout.querySelector('.toc-content')
      $tocLink = $cardToc.querySelectorAll('.toc-link')
      $tocPercentage = $cardTocLayout.querySelector('.toc-percentage')
      isExpand = $cardToc.classList.contains('is-expand')

      // toc元素點擊
      const tocItemClickFn = e => {
        const target = e.target.closest('.toc-link')
        if (!target) return

        e.preventDefault()
        btf.scrollToDest(btf.getEleTop(document.getElementById(decodeURI(target.getAttribute('href')).replace('#', ''))), 300)
        if (window.innerWidth < 900) {
          $cardTocLayout.classList.remove('open')
        }
      }

      btf.addEventListenerPjax($cardToc, 'click', tocItemClickFn)

      autoScrollToc = item => {
        const sidebarHeight = $cardToc.clientHeight
        const itemOffsetTop = item.offsetTop
        const itemHeight = item.clientHeight
        const scrollTop = $cardToc.scrollTop
        const offset = itemOffsetTop - scrollTop
        const middlePosition = (sidebarHeight - itemHeight) / 2

        if (offset !== middlePosition) {
          $cardToc.scrollTop = scrollTop + (offset - middlePosition)
        }
      }

      // 處理 hexo-blog-encrypt 事件
      $cardToc.style.display = 'block'
    }

    // find head position & add active class
    const $articleList = $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
    let detectItem = ''

    const findHeadPosition = top => {
      if (top === 0) return false

      let currentId = ''
      let currentIndex = ''

      for (let i = 0; i < $articleList.length; i++) {
        const ele = $articleList[i]
        if (top > btf.getEleTop(ele) - 80) {
          const id = ele.id
          currentId = id ? '#' + encodeURI(id) : ''
          currentIndex = i
        } else {
          break
        }
      }

      if (detectItem === currentIndex) return

      if (isAnchor) btf.updateAnchor(currentId)

      detectItem = currentIndex

      if (isToc) {
        $cardToc.querySelectorAll('.active').forEach(i => i.classList.remove('active'))

        if (currentId) {
          const currentActive = $tocLink[currentIndex]
          currentActive.classList.add('active')

          setTimeout(() => autoScrollToc(currentActive), 0)

          if (!isExpand) {
            let parent = currentActive.parentNode
            while (!parent.matches('.toc')) {
              if (parent.matches('li')) parent.classList.add('active')
              parent = parent.parentNode
            }
          }
        }
      }
    }

    // main of scroll
    const tocScrollFn = btf.throttle(() => {
      const currentTop = window.scrollY || document.documentElement.scrollTop
      if (isToc && GLOBAL_CONFIG.percent.toc) {
        $tocPercentage.textContent = btf.getScrollPercent(currentTop, $article)
      }
      findHeadPosition(currentTop)
    }, 100)

    btf.addEventListenerPjax(window, 'scroll', tocScrollFn, { passive: true })
  }

  const handleThemeChange = mode => {
    const globalFn = window.globalFn || {}
    const themeChange = globalFn.themeChange || {}
    if (!themeChange) {
      return
    }

    Object.keys(themeChange).forEach(key => {
      const themeChangeFn = themeChange[key]
      if (['disqus', 'disqusjs'].includes(key)) {
        setTimeout(() => themeChangeFn(mode), 300)
      } else {
        themeChangeFn(mode)
      }
    })
  }

  /**
   * Rightside
   */
  const rightSideFn = {
    readmode: () => { // read mode
      const $body = document.body
      const newEle = document.createElement('button')

      const exitReadMode = () => {
        $body.classList.remove('read-mode')
        newEle.remove()
        newEle.removeEventListener('click', exitReadMode)
      }

      $body.classList.add('read-mode')
      newEle.type = 'button'
      newEle.className = 'fas fa-sign-out-alt exit-readmode'
      newEle.addEventListener('click', exitReadMode)
      $body.appendChild(newEle)
    },
    darkmode: () => { // switch between light and dark mode
      // 检查是否启用昼夜切换动画
      if (typeof switchNightMode === 'function') {
        switchNightMode()
      } else {
        // 原版切换逻辑（降级方案）
        const willChangeMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
        if (willChangeMode === 'dark') {
          btf.activateDarkMode()
          GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night)
        } else {
          btf.activateLightMode()
          GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day)
        }
        btf.saveToLocal.set('theme', willChangeMode, 2)
        handleThemeChange(willChangeMode)  // 如果原有这行，请保留
      }
    },
    'rightside-config': item => { // Show or hide rightside-hide-btn
      const hideLayout = item.firstElementChild
      if (hideLayout.classList.contains('show')) {
        hideLayout.classList.add('status')
        setTimeout(() => {
          hideLayout.classList.remove('status')
        }, 300)
      }

      hideLayout.classList.toggle('show')
    },
    'go-up': () => { // Back to top
      btf.scrollToDest(0, 500)
    },
    'hide-aside-btn': () => { // Hide aside
      const $htmlDom = document.documentElement.classList
      const saveStatus = $htmlDom.contains('hide-aside') ? 'show' : 'hide'
      btf.saveToLocal.set('aside-status', saveStatus, 2)
      $htmlDom.toggle('hide-aside')
    },
    'mobile-toc-button': (p, item) => { // Show mobile toc
      const tocEle = document.getElementById('card-toc')
      tocEle.style.transition = 'transform 0.3s ease-in-out'

      const tocEleHeight = tocEle.clientHeight
      const btData = item.getBoundingClientRect()

      const tocEleBottom = window.innerHeight - btData.bottom - 30
      if (tocEleHeight > tocEleBottom) {
        tocEle.style.transformOrigin = `right ${tocEleHeight - tocEleBottom - btData.height / 2}px`
      }

      tocEle.classList.toggle('open')
      tocEle.addEventListener('transitionend', () => {
        tocEle.style.cssText = ''
      }, { once: true })
    },
    'chat-btn': () => { // Show chat
      window.chatBtnFn()
    },
    translateLink: () => { // switch between traditional and simplified chinese
      window.translateFn.translatePage()
    }
  }

  document.getElementById('rightside').addEventListener('click', e => {
    const $target = e.target.closest('[id]')
    if ($target && rightSideFn[$target.id]) {
      rightSideFn[$target.id](e.currentTarget, $target)
    }
  })

  /**
   * menu
   * 側邊欄sub-menu 展開/收縮
   */
  const clickFnOfSubMenu = () => {
    const handleClickOfSubMenu = e => {
      const target = e.target.closest('.site-page.group')
      if (!target) return
      target.classList.toggle('hide')
    }

    const menusItems = document.querySelector('#sidebar-menus .menus_items')
    menusItems && menusItems.addEventListener('click', handleClickOfSubMenu)
  }

  /**
   * 手机端目录点击
   */
  const openMobileMenu = () => {
    const toggleMenu = document.getElementById('toggle-menu')
    if (!toggleMenu) return
    btf.addEventListenerPjax(toggleMenu, 'click', () => { sidebarFn.open() })
  }

  /**
 * 複製時加上版權信息
 */
  const addCopyright = () => {
    const { limitCount, languages } = GLOBAL_CONFIG.copyright

    const handleCopy = e => {
      e.preventDefault()
      const copyFont = window.getSelection(0).toString()
      let textFont = copyFont
      if (copyFont.length > limitCount) {
        textFont = `${copyFont}\n\n\n${languages.author}\n${languages.link}${window.location.href}\n${languages.source}\n${languages.info}`
      }
      if (e.clipboardData) {
        return e.clipboardData.setData('text', textFont)
      } else {
        return window.clipboardData.setData('text', textFont)
      }
    }

    document.body.addEventListener('copy', handleCopy)
  }

  /**
   * 網頁運行時間
   */
  const addRuntime = () => {
    const $runtimeCount = document.getElementById('runtimeshow')
    if ($runtimeCount) {
      const publishDate = $runtimeCount.getAttribute('data-publishDate')
      $runtimeCount.textContent = `${btf.diffDate(publishDate)} ${GLOBAL_CONFIG.runtime}`
    }
    
    // 网站概览卡片的运行天数
    const $runtimeOverview = document.getElementById('runtimeshow-overview')
    if ($runtimeOverview) {
      const publishDate = $runtimeOverview.getAttribute('data-publishDate')
      $runtimeOverview.textContent = `${btf.diffDate(publishDate)} ${GLOBAL_CONFIG.runtime}`
    }
  }

  /**
   * 最後一次更新時間
   */
  const addLastPushDate = () => {
    const $lastPushDateItem = document.getElementById('last-push-date')
    if ($lastPushDateItem) {
      const lastPushDate = $lastPushDateItem.getAttribute('data-lastPushDate')
      $lastPushDateItem.textContent = btf.diffDate(lastPushDate, true)
    }
    
    // 网站概览卡片的最后更新时间
    const $lastPushDateOverview = document.getElementById('last-push-date-overview')
    if ($lastPushDateOverview) {
      const lastPushDate = $lastPushDateOverview.getAttribute('data-lastPushDate')
      $lastPushDateOverview.textContent = btf.diffDate(lastPushDate, true)
    }
  }

  /**
   * 随机标签颜色 + 智能布局限制行数（网站概览卡片）
   */
  const randomTagColors = () => {
    const tagCloud = document.getElementById('overview-tag-cloud')
    if (!tagCloud) return
    
    const tags = Array.from(tagCloud.querySelectorAll('.tag-item'))
    const colors = [
      '#4a90e2', '#50e3c2', '#f5a623', '#e74c3c', '#9b59b6',
      '#2ecc71', '#ff6b81', '#7b68ee', '#ffa500', '#1abc9c',
      '#e67e22', '#3498db', '#c0392b', '#16a085', '#d35400'
    ]
    
    // 深色模式颜色
    const darkColors = [
      '#6ba3e8', '#70e8cd', '#f7b655', '#f57f6c', '#b57ce3',
      '#52d97d', '#ff8599', '#9b86ec', '#ffb84d', '#48d7c5',
      '#f39c4f', '#5dade2', '#e57373', '#45b39d', '#e67e22'
    ]
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const currentColors = isDark ? darkColors : colors
    
    // Fisher-Yates 洗牌算法
    const shuffledColors = [...currentColors]
    for (let i = shuffledColors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledColors[i], shuffledColors[j]] = [shuffledColors[j], shuffledColors[i]]
    }
    
    // 先隐藏所有标签，避免闪烁
    tags.forEach(tag => {
      tag.style.visibility = 'hidden'
      tag.style.display = 'inline-block'
    })
    
    // 使用 requestAnimationFrame 确保在渲染后计算
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const maxLines = parseInt(tagCloud.style.getPropertyValue('--max-lines') || '5')
        if (tags.length === 0) return
        
        // 获取容器宽度
        const containerWidth = tagCloud.offsetWidth
        const gap = 6 // gap 间距
        
        // 计算每个标签的宽度
        const tagWidths = tags.map(tag => ({
          element: tag,
          width: tag.offsetWidth + gap
        }))
        
        // 智能排列算法
        const lines = []
        const usedIndices = new Set()
        
        for (let lineNum = 0; lineNum < maxLines; lineNum++) {
          let currentLineWidth = 0
          const currentLine = []
          
          // 贪心算法：优先选择能放下的标签
          for (let i = 0; i < tagWidths.length; i++) {
            if (usedIndices.has(i)) continue
            
            const tagWidth = tagWidths[i].width
            
            // 如果能放下这个标签
            if (currentLineWidth + tagWidth <= containerWidth + gap) {
              currentLine.push(i)
              currentLineWidth += tagWidth
              usedIndices.add(i)
            }
          }
          
          // 尝试填充剩余空间：找小标签填充
          const remainingSpace = containerWidth - currentLineWidth
          if (remainingSpace > 50) { // 如果剩余空间大于50px
            for (let i = 0; i < tagWidths.length; i++) {
              if (usedIndices.has(i)) continue
              
              const tagWidth = tagWidths[i].width
              if (tagWidth <= remainingSpace + gap) {
                currentLine.push(i)
                currentLineWidth += tagWidth
                usedIndices.add(i)
                break
              }
            }
          }
          
          if (currentLine.length === 0) break
          lines.push(currentLine)
        }
        
        // 重新排列 DOM 元素（直接移动而非克隆，保留事件监听器）
        const fragment = document.createDocumentFragment()
        const displayedIndices = new Set()
        
        lines.forEach(line => {
          line.forEach(index => {
            const tag = tagWidths[index].element
            const colorIndex = index % shuffledColors.length
            tag.style.color = shuffledColors[colorIndex]
            tag.style.visibility = 'visible'
            tag.style.display = 'inline-block'
            fragment.appendChild(tag) // 直接移动元素，不克隆
            displayedIndices.add(index)
          })
        })
        
        // 清空并重新添加
        tagCloud.innerHTML = ''
        tagCloud.appendChild(fragment)
        
        // 隐藏未显示的标签
        tags.forEach((tag, index) => {
          if (!displayedIndices.has(index)) {
            tag.style.display = 'none'
          }
        })
        
        // 控制"查看全部"按钮显示/隐藏
        const viewAllBtn = tagCloud.parentElement.querySelector('.view-all-tags')
        if (viewAllBtn) {
          if (usedIndices.size < tags.length) {
            viewAllBtn.style.display = 'block'
          } else {
            viewAllBtn.style.display = 'none'
          }
        }
      })
    })
  }

  /**
   * 同步统计数据到网站概览卡片（不蒜子/Umami）
   */
  const syncBusuanziToOverview = () => {
    const $busuanziSitePvOverview = document.getElementById('busuanzi_value_site_pv_overview')
    const $umamiSitePvOverview = document.getElementById('umami-site-pv-overview')
    
    // 检查是否存在 overview 元素
    if (!$busuanziSitePvOverview && !$umamiSitePvOverview) return
    
    // 同步函数
    const syncData = () => {
      // 同步不蒜子 PV
      const $busuanziSitePv = document.getElementById('busuanzi_value_site_pv')
      if ($busuanziSitePv && $busuanziSitePvOverview) {
        const pvText = $busuanziSitePv.textContent
        if (pvText && !pvText.includes('fa-spinner')) {
          $busuanziSitePvOverview.textContent = pvText
          return true
        }
      }
      
      // 同步 Umami PV
      const $umamiSitePv = document.getElementById('umami-site-pv')
      if ($umamiSitePv && $umamiSitePvOverview) {
        const pvText = $umamiSitePv.textContent
        if (pvText && !pvText.includes('fa-spinner')) {
          $umamiSitePvOverview.textContent = pvText
          return true
        }
      }
      
      // 如果 card_webinfo 不存在，检查 overview 自身是否已加载（不蒜子直接填充）
      if (!$busuanziSitePv && $busuanziSitePvOverview) {
        const pvText = $busuanziSitePvOverview.textContent
        if (pvText && !pvText.includes('fa-spinner')) {
          return true
        }
      }
      
      if (!$umamiSitePv && $umamiSitePvOverview) {
        const pvText = $umamiSitePvOverview.textContent
        if (pvText && !pvText.includes('fa-spinner')) {
          return true
        }
      }
      
      return false
    }
    
    // 使用 MutationObserver 监听数据加载
    const observer = new MutationObserver(() => {
      if (syncData()) {
        observer.disconnect()
      }
    })
    
    // 监听网站信息卡片的统计元素（如果存在）
    const $busuanziSitePv = document.getElementById('busuanzi_value_site_pv')
    const $umamiSitePv = document.getElementById('umami-site-pv')
    
    if ($busuanziSitePv) {
      observer.observe($busuanziSitePv, {
        childList: true,
        characterData: true,
        subtree: true
      })
    } else if ($busuanziSitePvOverview) {
      // 如果 card_webinfo 不存在，直接监听 overview 元素
      observer.observe($busuanziSitePvOverview, {
        childList: true,
        characterData: true,
        subtree: true
      })
    }
    
    if ($umamiSitePv) {
      observer.observe($umamiSitePv, {
        childList: true,
        characterData: true,
        subtree: true
      })
    } else if ($umamiSitePvOverview) {
      // 如果 card_webinfo 不存在，直接监听 overview 元素
      observer.observe($umamiSitePvOverview, {
        childList: true,
        characterData: true,
        subtree: true
      })
    }
    
    // 设置定时检查作为备用
    let checkCount = 0
    const checkInterval = setInterval(() => {
      if (syncData()) {
        clearInterval(checkInterval)
        observer.disconnect()
      }
      
      checkCount++
      if (checkCount > 20) { // 最多检查20次（10秒）
        clearInterval(checkInterval)
        observer.disconnect()
      }
    }, 500)
  }

  /**
   * table overflow
   */
  const addTableWrap = () => {
    const $table = document.querySelectorAll('#article-container table')
    if (!$table.length) return

    $table.forEach(item => {
      if (!item.closest('.highlight')) {
        btf.wrap(item, 'div', { class: 'table-wrap' })
      }
    })
  }

  /**
   * tag-hide
   */
  const clickFnOfTagHide = () => {
    const hideButtons = document.querySelectorAll('#article-container .hide-button')
    if (!hideButtons.length) return
    hideButtons.forEach(item => item.addEventListener('click', e => {
      const currentTarget = e.currentTarget
      currentTarget.classList.add('open')
      addJustifiedGallery(currentTarget.nextElementSibling.querySelectorAll('.gallery-container'))
    }, { once: true }))
  }

  const tabsFn = () => {
    const navTabsElements = document.querySelectorAll('#article-container .tabs')
    if (!navTabsElements.length) return

    const setActiveClass = (elements, activeIndex) => {
      elements.forEach((el, index) => {
        el.classList.toggle('active', index === activeIndex)
      })
    }

    const handleNavClick = e => {
      const target = e.target.closest('button')
      if (!target || target.classList.contains('active')) return

      const navItems = [...e.currentTarget.children]
      const tabContents = [...e.currentTarget.nextElementSibling.children]
      const indexOfButton = navItems.indexOf(target)
      setActiveClass(navItems, indexOfButton)
      e.currentTarget.classList.remove('no-default')
      setActiveClass(tabContents, indexOfButton)
      addJustifiedGallery(tabContents[indexOfButton].querySelectorAll('.gallery-container'), true)
    }

    const handleToTopClick = tabElement => e => {
      if (e.target.closest('button')) {
        btf.scrollToDest(btf.getEleTop(tabElement), 300)
      }
    }

    navTabsElements.forEach(tabElement => {
      btf.addEventListenerPjax(tabElement.firstElementChild, 'click', handleNavClick)
      btf.addEventListenerPjax(tabElement.lastElementChild, 'click', handleToTopClick(tabElement))
    })
  }

  const toggleCardCategory = () => {
    const cardCategory = document.querySelector('#aside-cat-list.expandBtn')
    if (!cardCategory) return

    const handleToggleBtn = e => {
      const target = e.target
      if (target.nodeName === 'I') {
        e.preventDefault()
        target.parentNode.classList.toggle('expand')
      }
    }
    btf.addEventListenerPjax(cardCategory, 'click', handleToggleBtn, true)
  }

  const addPostOutdateNotice = () => {
    const ele = document.getElementById('post-outdate-notice')
    if (!ele) return

    const { limitDay, messagePrev, messageNext, postUpdate } = JSON.parse(ele.getAttribute('data'))
    const diffDay = btf.diffDate(postUpdate)
    if (diffDay >= limitDay) {
      ele.textContent = `${messagePrev} ${diffDay} ${messageNext}`
      ele.hidden = false
    }
  }

  const lazyloadImg = () => {
    window.lazyLoadInstance = new LazyLoad({
      elements_selector: 'img',
      threshold: 0,
      data_src: 'lazy-src'
    })

    btf.addGlobalFn('pjaxComplete', () => {
      window.lazyLoadInstance.update()
    }, 'lazyload')
  }

  const relativeDate = selector => {
    selector.forEach(item => {
      item.textContent = btf.diffDate(item.getAttribute('datetime'), true)
      item.style.display = 'inline'
    })
  }

  const justifiedIndexPostUI = () => {
    const recentPostsElement = document.getElementById('recent-posts')
    if (!(recentPostsElement && recentPostsElement.classList.contains('masonry'))) return

    const init = () => {
      const masonryItem = new InfiniteGrid.MasonryInfiniteGrid('.recent-post-items', {
        gap: { horizontal: 10, vertical: 20 },
        useTransform: true,
        useResizeObserver: true
      })
      masonryItem.renderItems()
      btf.addGlobalFn('pjaxCompleteOnce', () => { masonryItem.destroy() }, 'removeJustifiedIndexPostUI')
    }

    typeof InfiniteGrid === 'function' ? init() : btf.getScript(`${GLOBAL_CONFIG.infinitegrid.js}`).then(init)
  }

  const unRefreshFn = () => {
    window.addEventListener('resize', () => {
      adjustMenu(false)
      mobileSidebarOpen && btf.isHidden(document.getElementById('toggle-menu')) && sidebarFn.close()
    })

    const menuMask = document.getElementById('menu-mask')
    menuMask && menuMask.addEventListener('click', () => { sidebarFn.close() })

    clickFnOfSubMenu()
    GLOBAL_CONFIG.islazyloadPlugin && lazyloadImg()
    GLOBAL_CONFIG.copyright !== undefined && addCopyright()

    if (GLOBAL_CONFIG.autoDarkmode) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (btf.saveToLocal.get('theme') !== undefined) return
        e.matches ? handleThemeChange('dark') : handleThemeChange('light')
      })
    }
  }

  const forPostFn = () => {
    addHighlightTool()
    addPhotoFigcaption()
    addJustifiedGallery(document.querySelectorAll('#article-container .gallery-container'))
    runLightbox()
    scrollFnToDo()
    addTableWrap()
    clickFnOfTagHide()
    tabsFn()
  }

  const refreshFn = () => {
    initAdjust()
    justifiedIndexPostUI()

    if (GLOBAL_CONFIG_SITE.pageType === 'post') {
      addPostOutdateNotice()
      GLOBAL_CONFIG.relativeDate.post && relativeDate(document.querySelectorAll('#post-meta time'))
    } else {
      GLOBAL_CONFIG.relativeDate.homepage && relativeDate(document.querySelectorAll('#recent-posts time'))
      GLOBAL_CONFIG.runtime && addRuntime()
      addLastPushDate()
      syncBusuanziToOverview()
      randomTagColors()
      toggleCardCategory()
    }

    GLOBAL_CONFIG_SITE.pageType === 'home' && scrollDownInIndex()
    scrollFn()

    forPostFn()
    GLOBAL_CONFIG_SITE.pageType !== 'shuoshuo' && btf.switchComments(document)
    openMobileMenu()
  }

  btf.addGlobalFn('pjaxComplete', refreshFn, 'refreshFn')
  refreshFn()
  unRefreshFn()

  // 處理 hexo-blog-encrypt 事件
  window.addEventListener('hexo-blog-decrypt', e => {
    forPostFn()
    window.translateFn.translateInitialization()
    Object.values(window.globalFn.encrypt).forEach(fn => {
      fn()
    })
  })
})
