// 导航栏滚动切换功能 (v6 - 无闪烁版)
(function() {
  'use strict';
  
  const THRESHOLD = 10;
  
  let anchorScrollTop = 0;
  let lastDirection = null;
  let isMenuBarVisible = true;
  
  let $nav, $menusItems, $pageNameContainer;
  
  function cacheDOM() {
    $nav = document.getElementById('nav');
    $menusItems = document.querySelector('#nav .menus_items');
    $pageNameContainer = document.getElementById('page-name-container');
  }
  
  function updatePageName() {
    const el = document.getElementById('page-name');
    if (el) el.innerText = document.title.split(' | ')[0];
  }
  
  // 检测鼠标是否在有子菜单的菜单项上
  function isHoveringMenuItem() {
    if (!$nav) return false;
    const hovered = $nav.querySelector('.menus_item:hover');
    return hovered && hovered.querySelector('.menus_item_child');
  }
  
  // 二级菜单：打开
  function openSubMenu() {
    if (!$nav || !isMenuBarVisible) return;
    $nav.classList.add('nav-menu-open');
  }
  
  // 二级菜单：关闭
  function closeSubMenu() {
    if (!$nav) return;
    $nav.classList.remove('nav-menu-open');
  }
  
  // 切换到菜单栏
  function showMenuBar() {
    if (!$menusItems || !$pageNameContainer) return;
    if (isMenuBarVisible) return; // 已经是菜单栏状态，无需操作
    
    isMenuBarVisible = true;
    $menusItems.classList.remove('hide');
    $pageNameContainer.classList.remove('show');
    
    // 如果鼠标在菜单项上，立即打开二级菜单（无延迟）
    if (isHoveringMenuItem()) {
      openSubMenu();
    }
  }
  
  // 切换到信息栏
  function showInfoBar() {
    if (!$menusItems || !$pageNameContainer) return;
    if (!isMenuBarVisible) return; // 已经是信息栏状态，无需操作
    
    isMenuBarVisible = false;
    closeSubMenu(); // 先关闭二级菜单
    $menusItems.classList.add('hide');
    $pageNameContainer.classList.add('show');
  }
  
  // 悬浮事件
  function onMouseEnter() {
    if (isMenuBarVisible) openSubMenu();
  }
  
  function onMouseLeave() {
    closeSubMenu();
  }
  
  function bindHoverEvents() {
    if (!$nav || window.innerWidth < 769) return;
    
    $nav.querySelectorAll('.menus_item').forEach(item => {
      if (item.dataset.hoverBound) return;
      if (item.querySelector('.menus_item_child')) {
        item.addEventListener('mouseenter', onMouseEnter);
        item.addEventListener('mouseleave', onMouseLeave);
      }
      item.dataset.hoverBound = '1';
    });
  }
  
  // 滚动处理
  function handleScroll() {
    const scrollY = window.scrollY;
    
    if (!$menusItems) {
      cacheDOM();
      if (!$menusItems) return;
    }
    
    // 方向检测
    const diff = scrollY - anchorScrollTop;
    if (Math.abs(diff) >= THRESHOLD) {
      const dir = diff > 0 ? 'down' : 'up';
      
      if (dir !== lastDirection && scrollY > 56) {
        lastDirection = dir;
        dir === 'down' ? showInfoBar() : showMenuBar();
      }
      
      anchorScrollTop = scrollY;
    }
    
    // 顶部重置
    if (scrollY <= 56 && !isMenuBarVisible) {
      showMenuBar();
      lastDirection = null;
    }
  }
  
  function init() {
    cacheDOM();
    updatePageName();
    
    if ($menusItems && $pageNameContainer) {
      $menusItems.style.transition = 'none';
      $pageNameContainer.style.transition = 'none';
      
      isMenuBarVisible = true;
      $menusItems.classList.remove('hide');
      $pageNameContainer.classList.remove('show');
      anchorScrollTop = window.scrollY;
      
      requestAnimationFrame(() => {
        $menusItems.style.transition = '';
        $pageNameContainer.style.transition = '';
      });
    }
    
    bindHoverEvents();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      cacheDOM();
      bindHoverEvents();
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  document.addEventListener('pjax:complete', () => {
    cacheDOM();
    updatePageName();
    bindHoverEvents();
    anchorScrollTop = 0;
    lastDirection = null;
    isMenuBarVisible = true;
    $menusItems?.classList.remove('hide');
    $pageNameContainer?.classList.remove('show');
  });
})();
