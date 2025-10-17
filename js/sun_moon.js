/**
 * 更新深色模式按钮图标
 */
function updateDarkmodeIcon(mode) {
  const buttonElement = document.getElementById('darkmode');
  if (buttonElement) {
    const iconElement = buttonElement.querySelector('i');
    if (iconElement) {
      if (mode === 'sun') {
        iconElement.classList.remove('fa-moon');
        iconElement.classList.add('fa-sun');
      } else {
        iconElement.classList.remove('fa-sun');
        iconElement.classList.add('fa-moon');
      }
    }
  }
}

/**
 * 昼夜切换动画
 */
function switchNightMode() {
  // 检查是否已有动画正在运行
  const existingSky = document.querySelector('.Cuteen_DarkSky');
  if (existingSky) {
    existingSky.remove();
  }
  
  // 获取当前主题
  const nowMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  
  // 插入动画元素
  const bodyElement = document.querySelector('body');
  bodyElement.insertAdjacentHTML('beforeend', '<div class="Cuteen_DarkSky"><div class="Cuteen_DarkPlanet"></div></div>');
  
  const planetElement = document.querySelector('.Cuteen_DarkPlanet');
  
  // 设置初始状态：根据当前模式显示太阳或月亮
  if (nowMode === 'dark') {
    planetElement.classList.add('to-moon');
  } else {
    planetElement.classList.add('to-sun');
  }
  
  // 旋转到180度（1秒后）切换太阳/月亮外观
  setTimeout(function() {
    if (nowMode === 'light') {
      // 从白天切换到黑夜：太阳变月亮
      planetElement.classList.remove('to-sun');
      planetElement.classList.add('to-moon');
    } else {
      // 从黑夜切换到白天：月亮变太阳
      planetElement.classList.remove('to-moon');
      planetElement.classList.add('to-sun');
    }
  }, 1000);
  
  // 如果切换到深色模式，添加流星效果
  if (nowMode === 'light') {
    setTimeout(function() {
      const skyElement = document.querySelector('.Cuteen_DarkSky');
      if (skyElement) {
        // 创建3颗流星
        for (let i = 0; i < 3; i++) {
          setTimeout(function() {
            const meteor = document.createElement('div');
            meteor.className = 'meteor';
            meteor.style.left = (Math.random() * 100) + '%';
            meteor.style.animationDelay = (Math.random() * 1) + 's';
            skyElement.appendChild(meteor);
            // 流星动画结束后移除
            setTimeout(() => meteor.remove(), 2000);
          }, i * 400);
        }
      }
    }, 500);
  }
  
  setTimeout(function() {
    const willChangeMode = nowMode === 'light' ? 'dark' : 'light';
    
    if (nowMode === 'light') {
      btf.activateDarkMode();
      GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.day_to_night);
      // 切换图标：进入深色模式显示太阳图标
      updateDarkmodeIcon('sun');
    } else {
      btf.activateLightMode();
      GLOBAL_CONFIG.Snackbar !== undefined && btf.snackbarShow(GLOBAL_CONFIG.Snackbar.night_to_day);
      // 切换图标：进入浅色模式显示月亮图标
      updateDarkmodeIcon('moon');
    }
    
    btf.saveToLocal.set('theme', willChangeMode, 2);
    
    // 处理主题变化回调
    typeof utterancesTheme === 'function' && utterancesTheme();
    typeof FB === 'object' && window.loadFBComment();
    window.DISQUS && document.getElementById('disqus_thread').children.length && setTimeout(() => window.disqusReset(), 200);
  }, 100);
  
  // 动画淡出（等待旋转完成）
  setTimeout(function() {
    const skyElement = document.querySelector('.Cuteen_DarkSky');
    if (skyElement) {
      skyElement.style.transition = 'opacity 1.5s';
      skyElement.style.opacity = '0';
      setTimeout(function() {
        if (skyElement.parentNode) {
          skyElement.remove();
        }
      }, 1500);
    }
  }, 2000);
}

// 页面加载时设置正确的图标
document.addEventListener('DOMContentLoaded', function() {
  const currentMode = document.documentElement.getAttribute('data-theme');
  if (currentMode === 'dark') {
    updateDarkmodeIcon('sun');
  } else {
    updateDarkmodeIcon('moon');
  }
});
