(function () {
  "use strict";

  var MOBILE_BREAKPOINT = 768;
  var TABLET_BREAKPOINT = 1024;
  var STYLE_TAG_ID = "ec-stylesheet-rules";
  var PROCESSED_ATTR = "data-ec-processed";
  var IS_FONT_SET = false;
  var IS_BORDER_BOX_SET = false;

  var propertyMap = {
    padding: "padding",
    paddingTop: "padding-top",
    paddingRight: "padding-right",
    paddingBottom: "padding-bottom",
    paddingLeft: "padding-left",
    margin: "margin",
    marginTop: "margin-top",
    marginRight: "margin-right",
    marginBottom: "margin-bottom",
    marginLeft: "margin-left",
    width: "width",
    minWidth: "min-width",
    maxWidth: "max-width",
    height: "height",
    minHeight: "min-height",
    maxHeight: "max-height",
    boxSizing: "box-sizing",
    overflow: "overflow",
    overflowX: "overflow-x",
    overflowY: "overflow-y",

    display: "display",
    visibility: "visibility",
    opacity: "opacity",
    position: "position",
    top: "top",
    right: "right",
    bottom: "bottom",
    left: "left",
    zIndex: "z-index",
    float: "float",
    clear: "clear",

    flexDirection: "flex-direction",
    flexWrap: "flex-wrap",
    flexFlow: "flex-flow",
    justifyContent: "justify-content",
    alignItems: "align-items",
    alignContent: "align-content",
    alignSelf: "align-self",
    flex: "flex",
    flexGrow: "flex-grow",
    flexShrink: "flex-shrink",
    flexBasis: "flex-basis",
    order: "order",
    gap: "gap",
    rowGap: "row-gap",
    columnGap: "column-gap",

    gridTemplateColumns: "grid-template-columns",
    gridTemplateRows: "grid-template-rows",
    gridColumn: "grid-column",
    gridRow: "grid-row",
    gridArea: "grid-area",
    gridGap: "grid-gap",

    fontSize: "font-size",
    fontWeight: "font-weight",
    fontFamily: "font-family",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    lineHeight: "line-height",
    letterSpacing: "letter-spacing",
    textAlign: "text-align",
    textDecoration: "text-decoration",
    textTransform: "text-transform",
    textOverflow: "text-overflow",
    whiteSpace: "white-space",
    wordBreak: "word-break",
    wordWrap: "word-wrap",
    color: "color",

    background: "background",
    backgroundColor: "background-color",
    backgroundImage: "background-image",
    backgroundSize: "background-size",
    backgroundPosition: "background-position",
    backgroundRepeat: "background-repeat",

    border: "border",
    borderTop: "border-top",
    borderRight: "border-right",
    borderBottom: "border-bottom",
    borderLeft: "border-left",
    borderWidth: "border-width",
    borderStyle: "border-style",
    borderColor: "border-color",
    borderRadius: "border-radius",
    borderTopLeftRadius: "border-top-left-radius",
    borderTopRightRadius: "border-top-right-radius",
    borderBottomLeftRadius: "border-bottom-left-radius",
    borderBottomRightRadius: "border-bottom-right-radius",
    outline: "outline",
    outlineColor: "outline-color",
    outlineWidth: "outline-width",
    outlineStyle: "outline-style",
    outlineOffset: "outline-offset",
    boxShadow: "box-shadow",

    transform: "transform",
    transformOrigin: "transform-origin",
    transition: "transition",
    animation: "animation",
    animationDuration: "animation-duration",
    animationTimingFunction: "animation-timing-function",
    animationDelay: "animation-delay",

    cursor: "cursor",
    pointerEvents: "pointer-events",
    userSelect: "user-select",
    resize: "resize",

    objectFit: "object-fit",
    objectPosition: "object-position",
    listStyle: "list-style",
    appearance: "appearance",
    content: "content",
    verticalAlign: "vertical-align",
    tableLayout: "table-layout",
    borderCollapse: "border-collapse",
    borderSpacing: "border-spacing"
  };

  function escapeClassName(name) {
    return name.replace(/[:\.\[\]\/!@#$%^&*()+=,<>?;'"{}|~`\\]/g, function (c) {
      return "\\" + c;
    });
  }

  function underscoresToSpaces(value) {
    return value.replace(/_/g, " ");
  }

  function camelToKebab(str) {
    return str.replace(/([A-Z])/g, function (match) {
      return "-" + match.toLowerCase();
    });
  }

  function resolveProperty(rawProp) {
    if (propertyMap[rawProp]) {
      return propertyMap[rawProp];
    }
    return camelToKebab(rawProp);
  }

  function parseClassName(token) {
    var parts = token.split(":");
    var isMobile = false;
    var isTablet = false;
    var pseudoClass = null;
    var declaration = null;

    if (parts.length === 1) {
      declaration = parts[0];
    } else if (parts.length === 2) {
      if (parts[0] === "mobile") {
        isMobile = true;
        declaration = parts[1];
      } else if (parts[0] === "tablet") {
        isTablet = true;
        declaration = parts[1];
      } else {
        pseudoClass = parts[0];
        declaration = parts[1];
      }
    } else if (parts.length === 3) {
      if (parts[0] === "mobile") {
        isMobile = true;
        pseudoClass = parts[1];
        declaration = parts[2];
      } else if (parts[0] === "tablet") {
        isTablet = true;
        pseudoClass = parts[1];
        declaration = parts[2];
      }
    }

    if (!declaration) {
      return null;
    }

    if (declaration === "eccard") {
      return {
        className: token,
        isMobile: isMobile,
        isTablet: isTablet,
        pseudoClass: pseudoClass,
        cssText: "background: var(--ec-bg, #ffffff); border: 1px solid var(--ec-border, #dee2e6); border-radius: 12px; overflow: hidden;"
      };
    }

    var gridMatch = declaration.match(/^ecgrid-(\d+)x(\d+)$/);
    if (gridMatch) {
      return {
        className: token,
        isMobile: isMobile,
        isTablet: isTablet,
        pseudoClass: pseudoClass,
        cssText: "display: grid; grid-template-columns: repeat(" + gridMatch[1] + ", 1fr); grid-template-rows: repeat(" + gridMatch[2] + ", 1fr);"
      };
    }

    var bounceMatch = declaration.match(/^ecbounce-(\d+)$/);
    if (bounceMatch) {
      return {
        className: token,
        isMobile: isMobile,
        isTablet: isTablet,
        pseudoClass: pseudoClass,
        cssBlock: [
          "transition: 0.2s;",
          ":hover { transform: scale(" + (1 + Number(bounceMatch[1]) / 100) + "); }",
          ":active { transform: scale(" + (1 - Number(bounceMatch[1]) / 100) + "); }"
        ]
      };
    }

    var dashIndex = declaration.search(/(?<=[a-zA-Z])-/);
    if (dashIndex === -1) {
      return null;
    }

    var rawProp = declaration.slice(0, dashIndex);
    var rawValue = declaration.slice(dashIndex + 1);

    if (!rawProp || !rawValue) {
      return null;
    }

    var cssProperty = resolveProperty(rawProp);
    var cssValue = underscoresToSpaces(rawValue);

    return {
      className: token,
      isMobile: isMobile,
      isTablet: isTablet,
      pseudoClass: pseudoClass,
      cssProperty: cssProperty,
      cssValue: cssValue,
    };
  }

  function buildCSSRule(descriptor) {
    var selector = "." + escapeClassName(descriptor.className);

    if (descriptor.pseudoClass) {
      selector = selector + ":" + descriptor.pseudoClass;
    }

    var declaration = descriptor.cssText 
      ? descriptor.cssText 
      : (descriptor.cssProperty + ": " + descriptor.cssValue + ";");
    
    if (descriptor.cssBlock) {
      var rules = [];
      descriptor.cssBlock.forEach(function (rule) {
        if (rule.startsWith(":")) {
          rules.push(selector + rule);
        } else {
          rules.push(selector + " { " + rule + " }");
        }
      });
      if (descriptor.isTablet) {
        return (
          "@media (max-width: " +
          TABLET_BREAKPOINT +
          "px) { " +
          rules.join(" ") +
          " }"
        );
      }
      if (descriptor.isMobile) {
        return (
          "@media (max-width: " +
          MOBILE_BREAKPOINT +
          "px) { " +
          rules.join(" ") +
          " }"
        );
      }
      return rules.join(" ");
    }
    if (descriptor.isTablet) {
      return (
        "@media (max-width: " +
        TABLET_BREAKPOINT +
        "px) { " +
        selector +
        " { " +
        declaration +
        " } }"
      );
    }
    if (descriptor.isMobile) {
      return (
        "@media (max-width: " +
        MOBILE_BREAKPOINT +
        "px) { " +
        selector +
        " { " +
        declaration +
        " } }"
      );
    }

    return selector + " { " + declaration + " }";
  }

  var generatedRules = {};
  var styleTag = null;

  function getStyleTag() {
    if (styleTag) {
      return styleTag;
    }
    styleTag = document.getElementById(STYLE_TAG_ID);
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = STYLE_TAG_ID;
      document.head.appendChild(styleTag);
    }
    return styleTag;
  }

  function injectRule(descriptor) {
    var key = descriptor.className;
    if (generatedRules[key]) {
      return;
    }

    var rule = buildCSSRule(descriptor);
    generatedRules[key] = rule;

    var tag = getStyleTag();
    tag.textContent += "\n" + rule;
  }

  function processElement(element) {
    if (!element.classList) {
      return;
    }
    element.classList.forEach(function (token) {
      var descriptor = parseClassName(token);
      if (descriptor) {
        injectRule(descriptor);
      }
    });
  }

  function scanDOM() {
    if (!IS_FONT_SET) {
      var fontRule = "* { font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; }";
      generatedRules["global-font"] = fontRule;
      getStyleTag().textContent += "\n" + fontRule;
      IS_FONT_SET = true;
    }
    if (!IS_BORDER_BOX_SET) {
      var globalRule = "* { box-sizing: border-box; }";
      generatedRules["global-border-box"] = globalRule;
      getStyleTag().textContent += "\n" + globalRule;
      IS_BORDER_BOX_SET = true;
    }
    var elements = document.querySelectorAll("*:not([" + PROCESSED_ATTR + "])");
    elements.forEach(function (el) {
      processElement(el);
      el.setAttribute(PROCESSED_ATTR, "1");
    });
  }

  function startObserver() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) {
            return;
          }
          processElement(node);
          node.querySelectorAll("*").forEach(processElement);
        });

        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          processElement(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  window.ECStyleSheet = {
    process: function (className) {
      var descriptor = parseClassName(className);
      if (descriptor) injectRule(descriptor);
    },
    processAll: function (classNames) {
      classNames.forEach(this.process.bind(this));
    },
    scan: scanDOM,
    getRules: function () {
      return Object.assign({}, generatedRules);
    },
    getStyleTag: getStyleTag
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      scanDOM();
      startObserver();
    });
  } else {
    scanDOM();
    startObserver();
  }
})();
