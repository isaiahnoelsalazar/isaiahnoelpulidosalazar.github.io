/**
 * ECStyleSheet
 * Dynamic CSS rule generator based on element class names.
 * Supports responsive prefixes (mobile:), pseudo-class prefixes (hover:, focus:),
 * and chainable modifiers (mobile:hover:).
 *
 * Usage: Just include this script. It runs automatically on DOMContentLoaded
 * and observes future DOM changes via MutationObserver.
 *
 * Class name format:
 *   property-value          → e.g. paddingTop-8px
 *   hover:property-value    → e.g. hover:color-red
 *   mobile:property-value   → e.g. mobile:fontSize-16px  (≤768px)
 *   mobile:hover:property-value → e.g. mobile:hover:color-blue
 *
 * For CSS values with spaces (e.g. border: solid black 1px),
 * replace spaces with underscores: border-solid_black_1px
 */

(function () {
  "use strict";

  /* ─── Constants ─────────────────────────────────────────────────────── */

  var MOBILE_BREAKPOINT = 768;
  var STYLE_TAG_ID = "ec-stylesheet-rules";
  var PROCESSED_ATTR = "data-ec-processed";

  /* ─── CSS property name map (camelCase → kebab-case) ────────────────── */

  var propertyMap = {
    // Box model
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

    // Display & layout
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

    // Flexbox
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

    // Grid
    gridTemplateColumns: "grid-template-columns",
    gridTemplateRows: "grid-template-rows",
    gridColumn: "grid-column",
    gridRow: "grid-row",
    gridArea: "grid-area",
    gridGap: "grid-gap",

    // Typography
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

    // Background
    background: "background",
    backgroundColor: "background-color",
    backgroundImage: "background-image",
    backgroundSize: "background-size",
    backgroundPosition: "background-position",
    backgroundRepeat: "background-repeat",

    // Border
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

    // Transform & animation
    transform: "transform",
    transformOrigin: "transform-origin",
    transition: "transition",
    animation: "animation",
    animationDuration: "animation-duration",
    animationTimingFunction: "animation-timing-function",
    animationDelay: "animation-delay",

    // Cursor & interaction
    cursor: "cursor",
    pointerEvents: "pointer-events",
    userSelect: "user-select",
    resize: "resize",

    // Misc
    objectFit: "object-fit",
    objectPosition: "object-position",
    listStyle: "list-style",
    appearance: "appearance",
    content: "content",
    verticalAlign: "vertical-align",
    tableLayout: "table-layout",
    borderCollapse: "border-collapse",
    borderSpacing: "border-spacing",
  };

  /* ─── Utilities ──────────────────────────────────────────────────────── */

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
    // Fallback: convert camelCase to kebab-case automatically
    return camelToKebab(rawProp);
  }

  /* ─── Class name parser ──────────────────────────────────────────────── */

  function parseClassName(token) {
    var parts = token.split(":");
    var isMobile = false;
    var pseudoClass = null;
    var declaration = null;

    if (parts.length === 1) {
      declaration = parts[0];
    } else if (parts.length === 2) {
      if (parts[0] === "mobile") {
        isMobile = true;
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
      }
    }

    if (!declaration) return null;

    // --- NEW: Custom Macros ---
    
    // 1. Basic Card Container
    if (declaration === "eccard") {
      return {
        className: token,
        isMobile: isMobile,
        pseudoClass: pseudoClass,
        cssText: "background: var(--ec-bg, #ffffff); border: 1px solid var(--ec-border, #dee2e6); border-radius: 12px; overflow: hidden;"
      };
    }

    // 2. Grid NxN (e.g., ecgrid-3x2)
    var gridMatch = declaration.match(/^ecgrid-(\d+)x(\d+)$/);
    if (gridMatch) {
      return {
        className: token,
        isMobile: isMobile,
        pseudoClass: pseudoClass,
        cssText: "display: grid; grid-template-columns: repeat(" + gridMatch[1] + ", 1fr); grid-template-rows: repeat(" + gridMatch[2] + ", 1fr);"
      };
    }

    // --- Standard property-value parser ---
    var dashIndex = declaration.search(/(?<=[a-zA-Z])-/);
    if (dashIndex === -1) return null;

    var rawProp = declaration.slice(0, dashIndex);
    var rawValue = declaration.slice(dashIndex + 1);

    if (!rawProp || !rawValue) return null;

    var cssProperty = resolveProperty(rawProp);
    var cssValue = underscoresToSpaces(rawValue);

    return {
      className: token,
      isMobile: isMobile,
      pseudoClass: pseudoClass,
      cssProperty: cssProperty,
      cssValue: cssValue,
    };
  }

  /* ─── Rule generator ─────────────────────────────────────────────────── */

  function buildCSSRule(descriptor) {
    var selector = "." + escapeClassName(descriptor.className);

    if (descriptor.pseudoClass) {
      selector = selector + ":" + descriptor.pseudoClass;
    }

    // Use cssText if provided by a macro, otherwise use standard property + value
    var declaration = descriptor.cssText 
      ? descriptor.cssText 
      : (descriptor.cssProperty + ": " + descriptor.cssValue + ";");

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

  /* ─── Stylesheet manager ─────────────────────────────────────────────── */

  var generatedRules = {};
  var styleTag = null;

  function getStyleTag() {
    if (styleTag) return styleTag;
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
    if (generatedRules[key]) return;

    var rule = buildCSSRule(descriptor);
    generatedRules[key] = rule;

    var tag = getStyleTag();
    tag.textContent += "\n" + rule;
  }

  /* ─── DOM scanner ────────────────────────────────────────────────────── */

  function processElement(element) {
    if (!element.classList) return;
    element.classList.forEach(function (token) {
      var descriptor = parseClassName(token);
      if (descriptor) {
        injectRule(descriptor);
      }
    });
  }

  function scanDOM() {
    var elements = document.querySelectorAll("*:not([" + PROCESSED_ATTR + "])");
    elements.forEach(function (el) {
      processElement(el);
      el.setAttribute(PROCESSED_ATTR, "1");
    });
  }

  /* ─── MutationObserver ───────────────────────────────────────────────── */

  function startObserver() {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          processElement(node);
          node.querySelectorAll("*").forEach(processElement);
        });

        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
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

  /* ─── Public API ─────────────────────────────────────────────────────── */

  window.ECStyleSheet = {
    /**
     * Manually process a class name and inject its CSS rule.
     * Useful for dynamically assigned classes added via JS.
     *
     * @param {string} className
     */
    process: function (className) {
      var descriptor = parseClassName(className);
      if (descriptor) injectRule(descriptor);
    },

    /**
     * Process an array of class names.
     * @param {string[]} classNames
     */
    processAll: function (classNames) {
      classNames.forEach(this.process.bind(this));
    },

    /**
     * Re-scan the entire DOM for new class names.
     */
    scan: scanDOM,

    /**
     * Returns all generated CSS rules as a plain object { className: ruleString }.
     */
    getRules: function () {
      return Object.assign({}, generatedRules);
    },

    /**
     * Returns the injected <style> tag element.
     */
    getStyleTag: getStyleTag,
  };

  /* ─── Boot ───────────────────────────────────────────────────────────── */

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
