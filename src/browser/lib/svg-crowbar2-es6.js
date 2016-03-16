const doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

const prefix = {
  xmlns: "http://www.w3.org/2000/xmlns/",
  xlink: "http://www.w3.org/1999/xlink",
  svg: "http://www.w3.org/2000/svg"
};

export function getSource(svg) {
  var emptySvg = window.document.createElementNS(prefix.svg, 'svg');
  window.document.body.appendChild(emptySvg);
  var emptySvgDeclarationComputed = getComputedStyle(emptySvg);

  svg.setAttribute("version", "1.1");

  // removing attributes so they aren't doubled up
  svg.removeAttribute("xmlns");
  svg.removeAttribute("xlink");

  // These are needed for the svg
  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
  }

  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
  }

  var cloneSvg = setInlineStyles(svg, emptySvgDeclarationComputed);
  var source = (new XMLSerializer()).serializeToString(cloneSvg);
  var rect = svg.getBoundingClientRect();

  // done remove the tmp svg for now
  window.document.body.removeChild(emptySvg);

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    class: svg.getAttribute("class"),
    id: svg.getAttribute("id"),
    source: [doctype + source]
  };
}

function setInlineStyles(svg, emptySvgDeclarationComputed) {
  function getStyles(element) {
    var cSSStyleDeclarationComputed = getComputedStyle(element);
    var i, len, key, value;
    var computedStyleStr = "";
    for (i=0, len=cSSStyleDeclarationComputed.length; i<len; i++) {
      key=cSSStyleDeclarationComputed[i];
      value=cSSStyleDeclarationComputed.getPropertyValue(key);
      if (value!==emptySvgDeclarationComputed.getPropertyValue(key)) {

        // if width & height specified in element, then ignore if css is auto
        if (key == 'width' || key == 'height') {
          if (element.getAttribute(key) && value === 'auto') continue;
        }

        computedStyleStr+=key+":"+value+";";
      }
    }

    return computedStyleStr;
  }

  function visit(target, node) {
    target.setAttribute('style', getStyles(node));

    if (node && node.hasChildNodes()) {
      var child = node.firstChild;
      while (child) {
        const clone = child.cloneNode(false);
        target.appendChild(clone);

        if (child.nodeType === 1 && child.nodeName != 'SCRIPT'){
          visit(clone, child);
        }
        child = child.nextSibling;
      }
    }
  }

  const cloneSvg = svg.cloneNode(false);
  visit(cloneSvg, svg);

  return cloneSvg;
}
