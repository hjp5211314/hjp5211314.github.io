/**
 * 布局8专属：日期格式化与交互逻辑
 */
(function() {
  'use strict';
  
  // 日期格式化（立即执行，避免闪烁）
  const hideStyle = document.createElement('style');
  hideStyle.textContent = '#recent-posts .post-meta-date time{visibility:hidden}';
  document.head.appendChild(hideStyle);
  
  const formatDates = () => {
    document.querySelectorAll('#recent-posts .post-meta-date time').forEach(el => {
      el.textContent = el.textContent.replace(/-/g, '/');
    });
    hideStyle.remove();
  };
  
  const navigateWithPJAX = (href, target) => {
    if (target && target !== '_self') {
      window.open(href, target);
      return;
    }

    if (window.pjax && typeof window.pjax.loadUrl === 'function') {
      window.pjax.loadUrl(href);
    } else {
      window.location.assign(href);
    }
  };

  // 卡片点击交互（双栏模式）
  const initCardClick = () => {
    document.querySelectorAll('#recent-posts.double-row .recent-post-item').forEach(card => {
      const link = card.querySelector('.article-title');
      if (!link) return;

      card.addEventListener('click', e => {
        const anchor = e.target.closest('a');
        if (anchor) {
          // 分类/标签等已有链接保持默认行为
          return;
        }

        const isDate = e.target.closest('.post-meta-date');
        if (isDate) return;

        e.preventDefault();
        navigateWithPJAX(link.href, link.target);
      });
    });
  };
  
  // 统一初始化
  const init = () => {
    formatDates();
    initCardClick();
  };
  
  document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
