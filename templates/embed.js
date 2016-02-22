if (typeof window.vDDF === 'undefined') {
  // create a placeholder for VDDF interface
  window.vDDF = {
    config: {
      baseUrl: '{{ baseUrl }}'
    }
  };
  var body = document.getElementsByTagName('body')[0];
  var scriptTag = document.createElement('script');
  scriptTag.setAttribute('type', 'text/javascript');
  scriptTag.setAttribute('src', '{{ scriptUrl }}');
  scriptTag.setAttribute('async', 'async');

  body.appendChild(scriptTag);
} else if (window.vDDF.mountAll) {
  window.vDDF.mountAll();
}
