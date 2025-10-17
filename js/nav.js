// 导航栏滚动切换功能
(function() {
  let lastScrollTop = 0;
  let ticking = false;
  let scrollStopTimer = null;
  
  const updatePageName = function() {
    const pageName = document.getElementById('page-name');
    const pageNameContainer = document.getElementById('page-name-container');
    
    if (!pageName || !pageNameContainer) {
      return;
    }
    
    // 获取页面标题
    const pageTitle = document.title.split(' | ')[0];
    pageName.innerText = pageTitle;
  };
  
  const bindNavHover = function() {
    const nav = document.getElementById('nav');
    if (!nav || window.innerWidth < 769) return;

    const menuItems = nav.querySelectorAll('.menus_item');
    menuItems.forEach(item => {
      if (item.dataset.hoverBound === 'true') return;
      const childMenu = item.querySelector('.menus_item_child');
      if (!childMenu) {
        item.dataset.hoverBound = 'true';
        return;
      }

      const openNav = () => {
        // 只有在非滚动状态下才允许打开菜单
        if (!nav.classList.contains('scrolling')) {
          nav.classList.add('nav-menu-open');
          // 【保障机制】强制隐藏页面标题容器，防止遮挡
          const pageNameContainer = document.getElementById('page-name-container');
          if (pageNameContainer) {
            pageNameContainer.classList.remove('show');
            pageNameContainer.style.zIndex = '-1';
          }
        }
      };
      const closeNav = () => {
        nav.classList.remove('nav-menu-open');
        // 【保障机制】恢复页面标题容器的 z-index
        const pageNameContainer = document.getElementById('page-name-container');
        if (pageNameContainer) {
          pageNameContainer.style.zIndex = '';
        }
      };

      item.addEventListener('mouseenter', openNav);
      item.addEventListener('mouseleave', closeNav);
      item.addEventListener('focusin', openNav);
      item.addEventListener('focusout', () => {
        if (!nav.contains(document.activeElement)) {
          nav.classList.remove('nav-menu-open');
        }
      });

      item.dataset.hoverBound = 'true';
    });
  };

  const handleScroll = function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        const currentTop = window.pageYOffset || document.documentElement.scrollTop;
        const menusItems = document.querySelector('#nav .menus_items');
        const pageNameContainer = document.getElementById('page-name-container');
        const navEl = document.getElementById('nav');
        
        if (!menusItems || !pageNameContainer) {
          ticking = false;
          return;
        }

        // 滚动时立刻关闭二级菜单并限制溢出
        if (navEl) {
          navEl.classList.add('scrolling');
          navEl.classList.remove('nav-menu-open');
          // 【保障机制】滚动时强制隐藏页面标题
          pageNameContainer.style.zIndex = '-1';
        }
        
        const isScrollingDown = currentTop > lastScrollTop;
        
        // 滚动距离大于56px
        if (currentTop > 56) {
          if (isScrollingDown) {
            // 向下滚动：隐藏菜单，显示标题
            menusItems.classList.add('hide');
            pageNameContainer.classList.add('show');
          } else {
            // 向上滚动：显示菜单，隐藏标题
            menusItems.classList.remove('hide');
            pageNameContainer.classList.remove('show');
          }
        } else {
          // 在顶部：显示菜单，隐藏标题
          menusItems.classList.remove('hide');
          pageNameContainer.classList.remove('show');
        }
        
        lastScrollTop = currentTop <= 0 ? 0 : currentTop;
        ticking = false;
      });
      
      ticking = true;
    }

    // 滚动结束后延时移除scrolling状态
    const navEl = document.getElementById('nav');
    if (navEl) {
      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => {
        navEl.classList.remove('scrolling');
        // 【保障机制】恢复页面标题的 z-index
        const pageNameContainer = document.getElementById('page-name-container');
        if (pageNameContainer && !navEl.classList.contains('nav-menu-open')) {
          pageNameContainer.style.zIndex = '';
        }
        // 滚动停止后，如果鼠标仍在菜单项上，重新检查是否需要打开
        const hoveredItem = navEl.querySelector('.menus_item:hover');
        if (hoveredItem && hoveredItem.querySelector('.menus_item_child')) {
          navEl.classList.add('nav-menu-open');
          if (pageNameContainer) {
            pageNameContainer.style.zIndex = '-1';
          }
        }
      }, 200);
    }
  };
  
  const init = function() {
    updatePageName();
    
    // 初始化显示状态
    const menusItems = document.querySelector('#nav .menus_items');
    const pageNameContainer = document.getElementById('page-name-container');
    
    if (menusItems && pageNameContainer) {
      // 刷新后始终显示菜单栏，隐藏标题，无过渡动画
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // 禁用过渡动画
      menusItems.style.transition = 'none';
      pageNameContainer.style.transition = 'none';
      
      // 强制显示菜单，隐藏标题
      menusItems.classList.remove('hide');
      pageNameContainer.classList.remove('show');
      pageNameContainer.style.zIndex = '';
      
      // 更新lastScrollTop为当前位置，避免初次滚动触发切换
      lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
      
      // 延迟恢复过渡动画
      setTimeout(() => {
        menusItems.style.transition = '';
        pageNameContainer.style.transition = '';
      }, 100);
    }
    
    bindNavHover();
    
    // 添加滚动监听
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // 【保障机制】窗口resize时重新绑定hover并重置状态
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const navEl = document.getElementById('nav');
        const pageNameContainer = document.getElementById('page-name-container');
        
        if (window.innerWidth >= 769) {
          // PC端：重新绑定hover
          bindNavHover();
          // 重置状态，防止遮挡
          if (navEl) {
            navEl.classList.remove('nav-menu-open', 'scrolling');
          }
          if (pageNameContainer) {
            pageNameContainer.style.zIndex = '';
          }
        }
      }, 150);
    });
  };
  
  // 页面加载时初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // PJAX支持
  document.addEventListener('pjax:complete', function() {
    lastScrollTop = 0;
    updatePageName();
    bindNavHover();
  });
})();
