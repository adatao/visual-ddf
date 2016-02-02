if (typeof window.VDDF === 'undefined') {
  // create a placeholder for VDDF interface
  window.VDDF = {
    config: {
      baseUrl: '{{ baseUrl }}'
    }
  };
  var body = document.getElementsByTagName('body')[0];
  var scriptTag = document.createElement('script');
  scriptTag.setAttribute('type', 'text/javascript');
  scriptTag.setAttribute('src', '{{scriptUrl}}');
  scriptTag.setAttribute('async', 'ascync');

  body.appendChild(scriptTag);
}
