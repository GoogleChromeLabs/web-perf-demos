const polyfill = (() => {
  if ("marker" in Element.prototype) {
    return
  }

  console.log('Loading patching polyfill...');

  function replaceRange(startNode, template) {
    const section = startNode.parentElement;
    const walker = document.createTreeWalker(
      section,
      NodeFilter.SHOW_COMMENT,
      null,
      false
    );
    walker.currentNode = startNode;
    let endNode;
    while (endNode = walker.nextNode()) {
      if (endNode.data.trim().startsWith("?end")) {
        break;
      }
    }

    if (endNode) {
      let current = startNode.nextSibling;
      while (current && current !== endNode) {
        const next = current.nextSibling;
        current.remove();
        current = next;
      }
      startNode.replaceWith(template.content.cloneNode(true));
      endNode.remove();
      template.remove();
    }
  }

  const processTemplate = (template) => {
    const [name, hash] = template.getAttribute('for').split('#');
    const section = document.querySelector(`section[marker="${name}"]`);
    if (section) {
      const walker = document.createTreeWalker(
        section,
        NodeFilter.SHOW_COMMENT,
        null,
        false
      );
      let node;
      while (node = walker.nextNode()) {
        const data = node.data.trim();
        if (hash) {
          const rangeNameMatch = data.match(/^\?start\s+name=["'](.*?)["']/);
          const markerNameMatch = data.match(/^\?marker\s+name=["'](.*?)["']/);
          if (rangeNameMatch && rangeNameMatch[1] === hash) {
            replaceRange(node, template);
            break;
          }
          if (markerNameMatch && markerNameMatch[1] === hash) {
            node.replaceWith(template.content.cloneNode(true));
            template.remove();
            break;
          }
        } else {
          if (data === "?start") {
            replaceRange(node, template);
            break;
          }
          if (data === "?marker") {
            node.replaceWith(template.content.cloneNode(true));
            template.remove();
            break;
          }
        }
      }
    }
  }

  // Handle existing templates
  document.querySelectorAll('template[for]').forEach(template => {
    processTemplate(template);
  });

  // Listen for newly inserted templates and handle them
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "TEMPLATE") {
            processTemplate(node);
          }
        });
      }
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();
