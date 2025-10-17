// 分页跳转功能
window.toPageInputChange = function() {
  const input = document.querySelector('.toPageGroup input');
  const button = document.querySelector('#toPageButton');
  
  if (input && button) {
    if (input.value && input.value.trim() !== '') {
      button.classList.add('haveValue');
    } else {
      button.classList.remove('haveValue');
    }
  }
};

window.toPageKeyPress = function(event, total, baseUrl, globalPageType) {
  // 检测回车键
  if (event.keyCode === 13 || event.key === 'Enter') {
    event.preventDefault();
    window.toPage(total, baseUrl, globalPageType);
  }
};

window.toPage = function(total, baseUrl, globalPageType) {
  const input = document.querySelector('.toPageGroup input');
  
  if (!input || !input.value) return;
  
  let page = parseInt(input.value);
  
  // 验证页码范围
  if (isNaN(page) || page < 1) {
    page = 1;
  } else if (page > total) {
    page = total;
  }
  
  // 生成跳转 URL (使用绝对路径)
  let url;
  if (page === 1) {
    url = '/';
  } else {
    url = '/page/' + page + '/';
  }
  
  // 跳转
  window.location.href = url;
};
