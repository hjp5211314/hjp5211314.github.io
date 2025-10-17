/**
 * 页面标题切换特效
 */
(function() {
  let originTitle = document.title;
  let titleTime;
  
  // 可自定义的文案
  const hiddenText = '🔍 404 - 页面不见了';
  const showText = '🎉 嘿嘿，上当了吧！';
  const duration = 1500; // 显示时长（毫秒）
  
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      // 页面隐藏时（切换到其他标签页）
      document.title = hiddenText;
      clearTimeout(titleTime);
    } else {
      // 页面显示时（返回本标签页）
      document.title = showText;
      titleTime = setTimeout(function() {
        document.title = originTitle;
      }, duration);
    }
  });
})();
