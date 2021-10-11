'use strict';

/* Riot v4.14.0, @license MIT */
/**
 * Convert a string from camel case to dash-case
 * @param   {string} string - probably a component tag name
 * @returns {string} component name normalized
 */
function camelToDashCase(string) {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
/**
 * Convert a string containing dashes to camel case
 * @param   {string} string - input string
 * @returns {string} my-string -> myString
 */

function dashToCamelCase(string) {
  return string.replace(/-(\w)/g, (_, c) => c.toUpperCase());
}

/**
 * Get all the element attributes as object
 * @param   {HTMLElement} element - DOM node we want to parse
 * @returns {Object} all the attributes found as a key value pairs
 */

function DOMattributesToObject(element) {
  return Array.from(element.attributes).reduce((acc, attribute) => {
    acc[dashToCamelCase(attribute.name)] = attribute.value;
    return acc;
  }, {});
}
/**
 * Move all the child nodes from a source tag to another
 * @param   {HTMLElement} source - source node
 * @param   {HTMLElement} target - target node
 * @returns {undefined} it's a void method ¯\_(ツ)_/¯
 */
// Ignore this helper because it's needed only for svg tags

function moveChildren(source, target) {
  if (source.firstChild) {
    target.appendChild(source.firstChild);
    moveChildren(source, target);
  }
}
/**
 * Remove the child nodes from any DOM node
 * @param   {HTMLElement} node - target node
 * @returns {undefined}
 */

function cleanNode(node) {
  clearChildren(node.childNodes);
}
/**
 * Clear multiple children in a node
 * @param   {HTMLElement[]} children - direct children nodes
 * @returns {undefined}
 */

function clearChildren(children) {
  Array.from(children).forEach(removeNode);
}
/**
 * Remove a node from the DOM
 * @param   {HTMLElement} node - target node
 * @returns {undefined}
 */

function removeNode(node) {
  const {
    parentNode
  } = node;
  if (node.remove) node.remove();
  /* istanbul ignore else */
  else if (parentNode) parentNode.removeChild(node);
}

const EACH = 0;
const IF = 1;
const SIMPLE = 2;
const TAG = 3;
const SLOT = 4;
var bindingTypes = {
  EACH,
  IF,
  SIMPLE,
  TAG,
  SLOT
};

const ATTRIBUTE = 0;
const EVENT = 1;
const TEXT = 2;
const VALUE = 3;
var expressionTypes = {
  ATTRIBUTE,
  EVENT,
  TEXT,
  VALUE
};

/**
 * Create the template meta object in case of <template> fragments
 * @param   {TemplateChunk} componentTemplate - template chunk object
 * @returns {Object} the meta property that will be passed to the mount function of the TemplateChunk
 */
function createTemplateMeta(componentTemplate) {
  const fragment = componentTemplate.dom.cloneNode(true);
  return {
    avoidDOMInjection: true,
    fragment,
    children: Array.from(fragment.childNodes)
  };
}

const {
  indexOf,
  slice
} = [];

const append = (get, parent, children, start, end, before) => {
  const isSelect = ('selectedIndex' in parent);
  let noSelection = isSelect;

  while (start < end) {
    const child = get(children[start], 1);
    parent.insertBefore(child, before);

    if (isSelect && noSelection && child.selected) {
      noSelection = !noSelection;
      let {
        selectedIndex
      } = parent;
      parent.selectedIndex = selectedIndex < 0 ? start : indexOf.call(parent.querySelectorAll('option'), child);
    }

    start++;
  }
};
const eqeq = (a, b) => a == b;
const identity = O => O;
const indexOf$1 = (moreNodes, moreStart, moreEnd, lessNodes, lessStart, lessEnd, compare) => {
  const length = lessEnd - lessStart;
  /* istanbul ignore if */

  if (length < 1) return -1;

  while (moreEnd - moreStart >= length) {
    let m = moreStart;
    let l = lessStart;

    while (m < moreEnd && l < lessEnd && compare(moreNodes[m], lessNodes[l])) {
      m++;
      l++;
    }

    if (l === lessEnd) return moreStart;
    moreStart = m + 1;
  }

  return -1;
};
const isReversed = (futureNodes, futureEnd, currentNodes, currentStart, currentEnd, compare) => {
  while (currentStart < currentEnd && compare(currentNodes[currentStart], futureNodes[futureEnd - 1])) {
    currentStart++;
    futureEnd--;
  }
  return futureEnd === 0;
};
const next = (get, list, i, length, before) => i < length ? get(list[i], 0) : 0 < i ? get(list[i - 1], -0).nextSibling : before;
const remove = (get, children, start, end) => {
  while (start < end) drop(get(children[start++], -1));
}; // - - - - - - - - - - - - - - - - - - -
// diff related constants and utilities
// - - - - - - - - - - - - - - - - - - -

const DELETION = -1;
const INSERTION = 1;
const SKIP = 0;
const SKIP_OND = 50;

const HS = (futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges) => {
  let k = 0;
  /* istanbul ignore next */

  let minLen = futureChanges < currentChanges ? futureChanges : currentChanges;
  const link = Array(minLen++);
  const tresh = Array(minLen);
  tresh[0] = -1;

  for (let i = 1; i < minLen; i++) tresh[i] = currentEnd;

  const nodes = currentNodes.slice(currentStart, currentEnd);

  for (let i = futureStart; i < futureEnd; i++) {
    const index = nodes.indexOf(futureNodes[i]);

    if (-1 < index) {
      const idxInOld = index + currentStart;
      k = findK(tresh, minLen, idxInOld);
      /* istanbul ignore else */

      if (-1 < k) {
        tresh[k] = idxInOld;
        link[k] = {
          newi: i,
          oldi: idxInOld,
          prev: link[k - 1]
        };
      }
    }
  }

  k = --minLen;
  --currentEnd;

  while (tresh[k] > currentEnd) --k;

  minLen = currentChanges + futureChanges - k;
  const diff = Array(minLen);
  let ptr = link[k];
  --futureEnd;

  while (ptr) {
    const {
      newi,
      oldi
    } = ptr;

    while (futureEnd > newi) {
      diff[--minLen] = INSERTION;
      --futureEnd;
    }

    while (currentEnd > oldi) {
      diff[--minLen] = DELETION;
      --currentEnd;
    }

    diff[--minLen] = SKIP;
    --futureEnd;
    --currentEnd;
    ptr = ptr.prev;
  }

  while (futureEnd >= futureStart) {
    diff[--minLen] = INSERTION;
    --futureEnd;
  }

  while (currentEnd >= currentStart) {
    diff[--minLen] = DELETION;
    --currentEnd;
  }

  return diff;
}; // this is pretty much the same petit-dom code without the delete map part
// https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L556-L561


const OND = (futureNodes, futureStart, rows, currentNodes, currentStart, cols, compare) => {
  const length = rows + cols;
  const v = [];
  let d, k, r, c, pv, cv, pd;

  outer: for (d = 0; d <= length; d++) {
    /* istanbul ignore if */
    if (d > SKIP_OND) return null;
    pd = d - 1;
    /* istanbul ignore next */

    pv = d ? v[d - 1] : [0, 0];
    cv = v[d] = [];

    for (k = -d; k <= d; k += 2) {
      if (k === -d || k !== d && pv[pd + k - 1] < pv[pd + k + 1]) {
        c = pv[pd + k + 1];
      } else {
        c = pv[pd + k - 1] + 1;
      }

      r = c - k;

      while (c < cols && r < rows && compare(currentNodes[currentStart + c], futureNodes[futureStart + r])) {
        c++;
        r++;
      }

      if (c === cols && r === rows) {
        break outer;
      }

      cv[d + k] = c;
    }
  }

  const diff = Array(d / 2 + length / 2);
  let diffIdx = diff.length - 1;

  for (d = v.length - 1; d >= 0; d--) {
    while (c > 0 && r > 0 && compare(currentNodes[currentStart + c - 1], futureNodes[futureStart + r - 1])) {
      // diagonal edge = equality
      diff[diffIdx--] = SKIP;
      c--;
      r--;
    }

    if (!d) break;
    pd = d - 1;
    /* istanbul ignore next */

    pv = d ? v[d - 1] : [0, 0];
    k = c - r;

    if (k === -d || k !== d && pv[pd + k - 1] < pv[pd + k + 1]) {
      // vertical edge = insertion
      r--;
      diff[diffIdx--] = INSERTION;
    } else {
      // horizontal edge = deletion
      c--;
      diff[diffIdx--] = DELETION;
    }
  }

  return diff;
};

const applyDiff = (diff, get, parentNode, futureNodes, futureStart, currentNodes, currentStart, currentLength, before) => {
  const live = [];
  const length = diff.length;
  let currentIndex = currentStart;
  let i = 0;

  while (i < length) {
    switch (diff[i++]) {
      case SKIP:
        futureStart++;
        currentIndex++;
        break;

      case INSERTION:
        // TODO: bulk appends for sequential nodes
        live.push(futureNodes[futureStart]);
        append(get, parentNode, futureNodes, futureStart++, futureStart, currentIndex < currentLength ? get(currentNodes[currentIndex], 0) : before);
        break;

      case DELETION:
        currentIndex++;
        break;
    }
  }

  i = 0;

  while (i < length) {
    switch (diff[i++]) {
      case SKIP:
        currentStart++;
        break;

      case DELETION:
        // TODO: bulk removes for sequential nodes
        if (-1 < live.indexOf(currentNodes[currentStart])) currentStart++;else remove(get, currentNodes, currentStart++, currentStart);
        break;
    }
  }
};

const findK = (ktr, length, j) => {
  let lo = 1;
  let hi = length;

  while (lo < hi) {
    const mid = (lo + hi) / 2 >>> 0;
    if (j < ktr[mid]) hi = mid;else lo = mid + 1;
  }

  return lo;
};

const smartDiff = (get, parentNode, futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges, currentLength, compare, before) => {
  applyDiff(OND(futureNodes, futureStart, futureChanges, currentNodes, currentStart, currentChanges, compare) || HS(futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges), get, parentNode, futureNodes, futureStart, currentNodes, currentStart, currentLength, before);
};

const drop = node => (node.remove || dropChild).call(node);

function dropChild() {
  const {
    parentNode
  } = this;
  /* istanbul ignore else */

  if (parentNode) parentNode.removeChild(this);
}

/*! (c) 2018 Andrea Giammarchi (ISC) */

const domdiff = (parentNode, // where changes happen
currentNodes, // Array of current items/nodes
futureNodes, // Array of future items/nodes
options // optional object with one of the following properties
//  before: domNode
//  compare(generic, generic) => true if same generic
//  node(generic) => Node
) => {
  if (!options) options = {};
  const compare = options.compare || eqeq;
  const get = options.node || identity;
  const before = options.before == null ? null : get(options.before, 0);
  const currentLength = currentNodes.length;
  let currentEnd = currentLength;
  let currentStart = 0;
  let futureEnd = futureNodes.length;
  let futureStart = 0; // common prefix

  while (currentStart < currentEnd && futureStart < futureEnd && compare(currentNodes[currentStart], futureNodes[futureStart])) {
    currentStart++;
    futureStart++;
  } // common suffix


  while (currentStart < currentEnd && futureStart < futureEnd && compare(currentNodes[currentEnd - 1], futureNodes[futureEnd - 1])) {
    currentEnd--;
    futureEnd--;
  }

  const currentSame = currentStart === currentEnd;
  const futureSame = futureStart === futureEnd; // same list

  if (currentSame && futureSame) return futureNodes; // only stuff to add

  if (currentSame && futureStart < futureEnd) {
    append(get, parentNode, futureNodes, futureStart, futureEnd, next(get, currentNodes, currentStart, currentLength, before));
    return futureNodes;
  } // only stuff to remove


  if (futureSame && currentStart < currentEnd) {
    remove(get, currentNodes, currentStart, currentEnd);
    return futureNodes;
  }

  const currentChanges = currentEnd - currentStart;
  const futureChanges = futureEnd - futureStart;
  let i = -1; // 2 simple indels: the shortest sequence is a subsequence of the longest

  if (currentChanges < futureChanges) {
    i = indexOf$1(futureNodes, futureStart, futureEnd, currentNodes, currentStart, currentEnd, compare); // inner diff

    if (-1 < i) {
      append(get, parentNode, futureNodes, futureStart, i, get(currentNodes[currentStart], 0));
      append(get, parentNode, futureNodes, i + currentChanges, futureEnd, next(get, currentNodes, currentEnd, currentLength, before));
      return futureNodes;
    }
  }
  /* istanbul ignore else */
  else if (futureChanges < currentChanges) {
      i = indexOf$1(currentNodes, currentStart, currentEnd, futureNodes, futureStart, futureEnd, compare); // outer diff

      if (-1 < i) {
        remove(get, currentNodes, currentStart, i);
        remove(get, currentNodes, i + futureChanges, currentEnd);
        return futureNodes;
      }
    } // common case with one replacement for many nodes
  // or many nodes replaced for a single one

  /* istanbul ignore else */


  if (currentChanges < 2 || futureChanges < 2) {
    append(get, parentNode, futureNodes, futureStart, futureEnd, get(currentNodes[currentStart], 0));
    remove(get, currentNodes, currentStart, currentEnd);
    return futureNodes;
  } // the half match diff part has been skipped in petit-dom
  // https://github.com/yelouafi/petit-dom/blob/bd6f5c919b5ae5297be01612c524c40be45f14a7/src/vdom.js#L391-L397
  // accordingly, I think it's safe to skip in here too
  // if one day it'll come out like the speediest thing ever to do
  // then I might add it in here too
  // Extra: before going too fancy, what about reversed lists ?
  //        This should bail out pretty quickly if that's not the case.


  if (currentChanges === futureChanges && isReversed(futureNodes, futureEnd, currentNodes, currentStart, currentEnd, compare)) {
    append(get, parentNode, futureNodes, futureStart, futureEnd, next(get, currentNodes, currentEnd, currentLength, before));
    return futureNodes;
  } // last resort through a smart diff


  smartDiff(get, parentNode, futureNodes, futureStart, futureEnd, futureChanges, currentNodes, currentStart, currentEnd, currentChanges, currentLength, compare, before);
  return futureNodes;
};

/**
 * Quick type checking
 * @param   {*} element - anything
 * @param   {string} type - type definition
 * @returns {boolean} true if the type corresponds
 */
function checkType(element, type) {
  return typeof element === type;
}
/**
 * Check if an element is part of an svg
 * @param   {HTMLElement}  el - element to check
 * @returns {boolean} true if we are in an svg context
 */

function isSvg(el) {
  const owner = el.ownerSVGElement;
  return !!owner || owner === null;
}
/**
 * Check if an element is a template tag
 * @param   {HTMLElement}  el - element to check
 * @returns {boolean} true if it's a <template>
 */

function isTemplate(el) {
  return !isNil(el.content);
}
/**
 * Check that will be passed if its argument is a function
 * @param   {*} value - value to check
 * @returns {boolean} - true if the value is a function
 */

function isFunction(value) {
  return checkType(value, 'function');
}
/**
 * Check if a value is a Boolean
 * @param   {*}  value - anything
 * @returns {boolean} true only for the value is a boolean
 */

function isBoolean(value) {
  return checkType(value, 'boolean');
}
/**
 * Check if a value is an Object
 * @param   {*}  value - anything
 * @returns {boolean} true only for the value is an object
 */

function isObject(value) {
  return !isNil(value) && checkType(value, 'object');
}
/**
 * Check if a value is null or undefined
 * @param   {*}  value - anything
 * @returns {boolean} true only for the 'undefined' and 'null' types
 */

function isNil(value) {
  return value === null || value === undefined;
}

const UNMOUNT_SCOPE = Symbol('unmount');
const EachBinding = Object.seal({
  // dynamic binding properties
  // childrenMap: null,
  // node: null,
  // root: null,
  // condition: null,
  // evaluate: null,
  // template: null,
  // isTemplateTag: false,
  nodes: [],

  // getKey: null,
  // indexName: null,
  // itemName: null,
  // afterPlaceholder: null,
  // placeholder: null,
  // API methods
  mount(scope, parentScope) {
    return this.update(scope, parentScope);
  },

  update(scope, parentScope) {
    const {
      placeholder,
      nodes,
      childrenMap
    } = this;
    const collection = scope === UNMOUNT_SCOPE ? null : this.evaluate(scope);
    const items = collection ? Array.from(collection) : [];
    const parent = placeholder.parentNode; // prepare the diffing

    const {
      newChildrenMap,
      batches,
      futureNodes
    } = createPatch(items, scope, parentScope, this); // patch the DOM only if there are new nodes

    domdiff(parent, nodes, futureNodes, {
      before: placeholder,
      node: patch(Array.from(childrenMap.values()), parentScope)
    }); // trigger the mounts and the updates

    batches.forEach(fn => fn()); // update the children map

    this.childrenMap = newChildrenMap;
    this.nodes = futureNodes;
    return this;
  },

  unmount(scope, parentScope) {
    this.update(UNMOUNT_SCOPE, parentScope);
    return this;
  }

});
/**
 * Patch the DOM while diffing
 * @param   {TemplateChunk[]} redundant - redundant tepmplate chunks
 * @param   {*} parentScope - scope of the parent template
 * @returns {Function} patch function used by domdiff
 */

function patch(redundant, parentScope) {
  return (item, info) => {
    if (info < 0) {
      const element = redundant.pop();

      if (element) {
        const {
          template,
          context
        } = element; // notice that we pass null as last argument because
        // the root node and its children will be removed by domdiff

        template.unmount(context, parentScope, null);
      }
    }

    return item;
  };
}
/**
 * Check whether a template must be filtered from a loop
 * @param   {Function} condition - filter function
 * @param   {Object} context - argument passed to the filter function
 * @returns {boolean} true if this item should be skipped
 */


function mustFilterItem(condition, context) {
  return condition ? Boolean(condition(context)) === false : false;
}
/**
 * Extend the scope of the looped template
 * @param   {Object} scope - current template scope
 * @param   {string} options.itemName - key to identify the looped item in the new context
 * @param   {string} options.indexName - key to identify the index of the looped item
 * @param   {number} options.index - current index
 * @param   {*} options.item - collection item looped
 * @returns {Object} enhanced scope object
 */


function extendScope(scope, _ref) {
  let {
    itemName,
    indexName,
    index,
    item
  } = _ref;
  scope[itemName] = item;
  if (indexName) scope[indexName] = index;
  return scope;
}
/**
 * Loop the current template items
 * @param   {Array} items - expression collection value
 * @param   {*} scope - template scope
 * @param   {*} parentScope - scope of the parent template
 * @param   {EeachBinding} binding - each binding object instance
 * @returns {Object} data
 * @returns {Map} data.newChildrenMap - a Map containing the new children template structure
 * @returns {Array} data.batches - array containing the template lifecycle functions to trigger
 * @returns {Array} data.futureNodes - array containing the nodes we need to diff
 */


function createPatch(items, scope, parentScope, binding) {
  const {
    condition,
    template,
    childrenMap,
    itemName,
    getKey,
    indexName,
    root,
    isTemplateTag
  } = binding;
  const newChildrenMap = new Map();
  const batches = [];
  const futureNodes = [];
  items.forEach((item, index) => {
    const context = extendScope(Object.create(scope), {
      itemName,
      indexName,
      index,
      item
    });
    const key = getKey ? getKey(context) : index;
    const oldItem = childrenMap.get(key);

    if (mustFilterItem(condition, context)) {
      return;
    }

    const componentTemplate = oldItem ? oldItem.template : template.clone();
    const el = oldItem ? componentTemplate.el : root.cloneNode();
    const mustMount = !oldItem;
    const meta = isTemplateTag && mustMount ? createTemplateMeta(componentTemplate) : {};

    if (mustMount) {
      batches.push(() => componentTemplate.mount(el, context, parentScope, meta));
    } else {
      batches.push(() => componentTemplate.update(context, parentScope));
    } // create the collection of nodes to update or to add
    // in case of template tags we need to add all its children nodes


    if (isTemplateTag) {
      const children = meta.children || componentTemplate.children;
      futureNodes.push(...children);
    } else {
      futureNodes.push(el);
    } // delete the old item from the children map


    childrenMap.delete(key); // update the children map

    newChildrenMap.set(key, {
      template: componentTemplate,
      context,
      index
    });
  });
  return {
    newChildrenMap,
    batches,
    futureNodes
  };
}

function create(node, _ref2) {
  let {
    evaluate,
    condition,
    itemName,
    indexName,
    getKey,
    template
  } = _ref2;
  const placeholder = document.createTextNode('');
  const parent = node.parentNode;
  const root = node.cloneNode();
  parent.insertBefore(placeholder, node);
  removeNode(node);
  return Object.assign({}, EachBinding, {
    childrenMap: new Map(),
    node,
    root,
    condition,
    evaluate,
    isTemplateTag: isTemplate(root),
    template: template.createDOM(node),
    getKey,
    indexName,
    itemName,
    placeholder
  });
}

/**
 * Binding responsible for the `if` directive
 */

const IfBinding = Object.seal({
  // dynamic binding properties
  // node: null,
  // evaluate: null,
  // isTemplateTag: false,
  // placeholder: null,
  // template: null,
  // API methods
  mount(scope, parentScope) {
    return this.update(scope, parentScope);
  },

  update(scope, parentScope) {
    const value = !!this.evaluate(scope);
    const mustMount = !this.value && value;
    const mustUnmount = this.value && !value;

    const mount = () => {
      const pristine = this.node.cloneNode();
      this.placeholder.parentNode.insertBefore(pristine, this.placeholder);
      this.template = this.template.clone();
      this.template.mount(pristine, scope, parentScope);
    };

    switch (true) {
      case mustMount:
        mount();
        break;

      case mustUnmount:
        this.unmount(scope);
        break;

      default:
        if (value) this.template.update(scope, parentScope);
    }

    this.value = value;
    return this;
  },

  unmount(scope, parentScope) {
    this.template.unmount(scope, parentScope, true);
    return this;
  }

});
function create$1(node, _ref) {
  let {
    evaluate,
    template
  } = _ref;
  const parent = node.parentNode;
  const placeholder = document.createTextNode('');
  parent.insertBefore(placeholder, node);
  removeNode(node);
  return Object.assign({}, IfBinding, {
    node,
    evaluate,
    placeholder,
    template: template.createDOM(node)
  });
}

/**
 * Throw an error with a descriptive message
 * @param   { string } message - error message
 * @returns { undefined } hoppla.. at this point the program should stop working
 */

function panic(message) {
  throw new Error(message);
}
/**
 * Returns the memoized (cached) function.
 * // borrowed from https://www.30secondsofcode.org/js/s/memoize
 * @param {Function} fn - function to memoize
 * @returns {Function} memoize function
 */

function memoize(fn) {
  const cache = new Map();

  const cached = val => {
    return cache.has(val) ? cache.get(val) : cache.set(val, fn.call(this, val)) && cache.get(val);
  };

  cached.cache = cache;
  return cached;
}
/**
 * Evaluate a list of attribute expressions
 * @param   {Array} attributes - attribute expressions generated by the riot compiler
 * @returns {Object} key value pairs with the result of the computation
 */

function evaluateAttributeExpressions(attributes) {
  return attributes.reduce((acc, attribute) => {
    const {
      value,
      type
    } = attribute;

    switch (true) {
      // spread attribute
      case !attribute.name && type === ATTRIBUTE:
        return Object.assign({}, acc, value);
      // value attribute

      case type === VALUE:
        acc.value = attribute.value;
        break;
      // normal attributes

      default:
        acc[dashToCamelCase(attribute.name)] = attribute.value;
    }

    return acc;
  }, {});
}

const REMOVE_ATTRIBUTE = 'removeAttribute';
const SET_ATTIBUTE = 'setAttribute';
const ElementProto = typeof Element === 'undefined' ? {} : Element.prototype;
const isNativeHtmlProperty = memoize(name => ElementProto.hasOwnProperty(name)); // eslint-disable-line

/**
 * Add all the attributes provided
 * @param   {HTMLElement} node - target node
 * @param   {Object} attributes - object containing the attributes names and values
 * @returns {undefined} sorry it's a void function :(
 */

function setAllAttributes(node, attributes) {
  Object.entries(attributes).forEach((_ref) => {
    let [name, value] = _ref;
    return attributeExpression(node, {
      name
    }, value);
  });
}
/**
 * Remove all the attributes provided
 * @param   {HTMLElement} node - target node
 * @param   {Object} newAttributes - object containing all the new attribute names
 * @param   {Object} oldAttributes - object containing all the old attribute names
 * @returns {undefined} sorry it's a void function :(
 */


function removeAllAttributes(node, newAttributes, oldAttributes) {
  const newKeys = newAttributes ? Object.keys(newAttributes) : [];
  Object.keys(oldAttributes).filter(name => !newKeys.includes(name)).forEach(attribute => node.removeAttribute(attribute));
}
/**
 * This methods handles the DOM attributes updates
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - attribute name
 * @param   {*} value - new expression value
 * @param   {*} oldValue - the old expression cached value
 * @returns {undefined}
 */


function attributeExpression(node, _ref2, value, oldValue) {
  let {
    name
  } = _ref2;

  // is it a spread operator? {...attributes}
  if (!name) {
    if (oldValue) {
      // remove all the old attributes
      removeAllAttributes(node, value, oldValue);
    } // is the value still truthy?


    if (value) {
      setAllAttributes(node, value);
    }

    return;
  } // handle boolean attributes


  if (!isNativeHtmlProperty(name) && (isBoolean(value) || isObject(value) || isFunction(value))) {
    node[name] = value;
  }

  node[getMethod(value)](name, normalizeValue(name, value));
}
/**
 * Get the attribute modifier method
 * @param   {*} value - if truthy we return `setAttribute` othewise `removeAttribute`
 * @returns {string} the node attribute modifier method name
 */

function getMethod(value) {
  return isNil(value) || value === false || value === '' || isObject(value) || isFunction(value) ? REMOVE_ATTRIBUTE : SET_ATTIBUTE;
}
/**
 * Get the value as string
 * @param   {string} name - attribute name
 * @param   {*} value - user input value
 * @returns {string} input value as string
 */


function normalizeValue(name, value) {
  // be sure that expressions like selected={ true } will be always rendered as selected='selected'
  if (value === true) return name;
  return value;
}

const RE_EVENTS_PREFIX = /^on/;

const getCallbackAndOptions = value => Array.isArray(value) ? value : [value, false]; // see also https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38


const EventListener = {
  handleEvent(event) {
    this[event.type](event);
  }

};
const ListenersWeakMap = new WeakMap();

const createListener = node => {
  const listener = Object.create(EventListener);
  ListenersWeakMap.set(node, listener);
  return listener;
};
/**
 * Set a new event listener
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {string} expression.name - event name
 * @param   {*} value - new expression value
 * @returns {value} the callback just received
 */


function eventExpression(node, _ref, value) {
  let {
    name
  } = _ref;
  const normalizedEventName = name.replace(RE_EVENTS_PREFIX, '');
  const eventListener = ListenersWeakMap.get(node) || createListener(node);
  const [callback, options] = getCallbackAndOptions(value);
  const handler = eventListener[normalizedEventName];
  const mustRemoveEvent = handler && !callback;
  const mustAddEvent = callback && !handler;

  if (mustRemoveEvent) {
    node.removeEventListener(normalizedEventName, eventListener);
  }

  if (mustAddEvent) {
    node.addEventListener(normalizedEventName, eventListener, options);
  }

  eventListener[normalizedEventName] = callback;
}

/**
 * Normalize the user value in order to render a empty string in case of falsy values
 * @param   {*} value - user input value
 * @returns {string} hopefully a string
 */

function normalizeStringValue(value) {
  return isNil(value) ? '' : value;
}

/**
 * Get the the target text node to update or create one from of a comment node
 * @param   {HTMLElement} node - any html element containing childNodes
 * @param   {number} childNodeIndex - index of the text node in the childNodes list
 * @returns {HTMLTextNode} the text node to update
 */

const getTextNode = (node, childNodeIndex) => {
  const target = node.childNodes[childNodeIndex];

  if (target.nodeType === Node.COMMENT_NODE) {
    const textNode = document.createTextNode('');
    node.replaceChild(textNode, target);
    return textNode;
  }

  return target;
};
/**
 * This methods handles a simple text expression update
 * @param   {HTMLElement} node - target node
 * @param   {Object} data - expression object
 * @param   {*} value - new expression value
 * @returns {undefined}
 */

function textExpression(node, data, value) {
  node.data = normalizeStringValue(value);
}

/**
 * This methods handles the input fileds value updates
 * @param   {HTMLElement} node - target node
 * @param   {Object} expression - expression object
 * @param   {*} value - new expression value
 * @returns {undefined}
 */

function valueExpression(node, expression, value) {
  node.value = normalizeStringValue(value);
}

var expressions = {
  [ATTRIBUTE]: attributeExpression,
  [EVENT]: eventExpression,
  [TEXT]: textExpression,
  [VALUE]: valueExpression
};

const Expression = Object.seal({
  // Static props
  // node: null,
  // value: null,
  // API methods

  /**
   * Mount the expression evaluating its initial value
   * @param   {*} scope - argument passed to the expression to evaluate its current values
   * @returns {Expression} self
   */
  mount(scope) {
    // hopefully a pure function
    this.value = this.evaluate(scope); // IO() DOM updates

    apply(this, this.value);
    return this;
  },

  /**
   * Update the expression if its value changed
   * @param   {*} scope - argument passed to the expression to evaluate its current values
   * @returns {Expression} self
   */
  update(scope) {
    // pure function
    const value = this.evaluate(scope);

    if (this.value !== value) {
      // IO() DOM updates
      apply(this, value);
      this.value = value;
    }

    return this;
  },

  /**
   * Expression teardown method
   * @returns {Expression} self
   */
  unmount() {
    // unmount only the event handling expressions
    if (this.type === EVENT) apply(this, null);
    return this;
  }

});
/**
 * IO() function to handle the DOM updates
 * @param {Expression} expression - expression object
 * @param {*} value - current expression value
 * @returns {undefined}
 */

function apply(expression, value) {
  return expressions[expression.type](expression.node, expression, value, expression.value);
}

function create$2(node, data) {
  return Object.assign({}, Expression, data, {
    node: data.type === TEXT ? getTextNode(node, data.childNodeIndex) : node
  });
}

/**
 * Create a flat object having as keys a list of methods that if dispatched will propagate
 * on the whole collection
 * @param   {Array} collection - collection to iterate
 * @param   {Array<string>} methods - methods to execute on each item of the collection
 * @param   {*} context - context returned by the new methods created
 * @returns {Object} a new object to simplify the the nested methods dispatching
 */
function flattenCollectionMethods(collection, methods, context) {
  return methods.reduce((acc, method) => {
    return Object.assign({}, acc, {
      [method]: scope => {
        return collection.map(item => item[method](scope)) && context;
      }
    });
  }, {});
}

function create$3(node, _ref) {
  let {
    expressions
  } = _ref;
  return Object.assign({}, flattenCollectionMethods(expressions.map(expression => create$2(node, expression)), ['mount', 'update', 'unmount']));
}

// Riot.js constants that can be used accross more modules
const COMPONENTS_IMPLEMENTATION_MAP = new Map(),
      DOM_COMPONENT_INSTANCE_PROPERTY = Symbol('riot-component'),
      PLUGINS_SET = new Set(),
      IS_DIRECTIVE = 'is',
      MOUNT_METHOD_KEY = 'mount',
      UPDATE_METHOD_KEY = 'update',
      UNMOUNT_METHOD_KEY = 'unmount',
      SHOULD_UPDATE_KEY = 'shouldUpdate',
      ON_BEFORE_MOUNT_KEY = 'onBeforeMount',
      ON_MOUNTED_KEY = 'onMounted',
      ON_BEFORE_UPDATE_KEY = 'onBeforeUpdate',
      ON_UPDATED_KEY = 'onUpdated',
      ON_BEFORE_UNMOUNT_KEY = 'onBeforeUnmount',
      ON_UNMOUNTED_KEY = 'onUnmounted',
      PROPS_KEY = 'props',
      STATE_KEY = 'state',
      SLOTS_KEY = 'slots',
      ROOT_KEY = 'root',
      IS_PURE_SYMBOL = Symbol.for('pure'),
      PARENT_KEY_SYMBOL = Symbol('parent'),
      ATTRIBUTES_KEY_SYMBOL = Symbol('attributes'),
      TEMPLATE_KEY_SYMBOL = Symbol('template');

function extendParentScope(attributes, scope, parentScope) {
  if (!attributes || !attributes.length) return parentScope;
  const expressions = attributes.map(attr => Object.assign({}, attr, {
    value: attr.evaluate(scope)
  }));
  return Object.assign(Object.create(parentScope || null), evaluateAttributeExpressions(expressions));
} // this function is only meant to fix an edge case
// https://github.com/riot/riot/issues/2842


const getRealParent = (scope, parentScope) => scope[PARENT_KEY_SYMBOL] || parentScope;

const SlotBinding = Object.seal({
  // dynamic binding properties
  // node: null,
  // name: null,
  attributes: [],

  // template: null,
  getTemplateScope(scope, parentScope) {
    return extendParentScope(this.attributes, scope, parentScope);
  },

  // API methods
  mount(scope, parentScope) {
    const templateData = scope.slots ? scope.slots.find((_ref) => {
      let {
        id
      } = _ref;
      return id === this.name;
    }) : false;
    const {
      parentNode
    } = this.node;
    const realParent = getRealParent(scope, parentScope);
    this.template = templateData && create$6(templateData.html, templateData.bindings).createDOM(parentNode);

    if (this.template) {
      this.template.mount(this.node, this.getTemplateScope(scope, realParent), realParent);
      this.template.children = moveSlotInnerContent(this.node);
    }

    removeNode(this.node);
    return this;
  },

  update(scope, parentScope) {
    if (this.template) {
      const realParent = getRealParent(scope, parentScope);
      this.template.update(this.getTemplateScope(scope, realParent), realParent);
    }

    return this;
  },

  unmount(scope, parentScope, mustRemoveRoot) {
    if (this.template) {
      this.template.unmount(this.getTemplateScope(scope, parentScope), null, mustRemoveRoot);
    }

    return this;
  }

});
/**
 * Move the inner content of the slots outside of them
 * @param   {HTMLNode} slot - slot node
 * @param   {HTMLElement} children - array to fill with the child nodes detected
 * @returns {HTMLElement[]} list of the node moved
 */

function moveSlotInnerContent(slot, children) {
  if (children === void 0) {
    children = [];
  }

  const child = slot.firstChild;

  if (child) {
    slot.parentNode.insertBefore(child, slot);
    return [child, ...moveSlotInnerContent(slot)];
  }

  return children;
}
/**
 * Create a single slot binding
 * @param   {HTMLElement} node - slot node
 * @param   {string} options.name - slot id
 * @returns {Object} Slot binding object
 */


function createSlot(node, _ref2) {
  let {
    name,
    attributes
  } = _ref2;
  return Object.assign({}, SlotBinding, {
    attributes,
    node,
    name
  });
}

/**
 * Create a new tag object if it was registered before, otherwise fallback to the simple
 * template chunk
 * @param   {Function} component - component factory function
 * @param   {Array<Object>} slots - array containing the slots markup
 * @param   {Array} attributes - dynamic attributes that will be received by the tag element
 * @returns {TagImplementation|TemplateChunk} a tag implementation or a template chunk as fallback
 */

function getTag(component, slots, attributes) {
  if (slots === void 0) {
    slots = [];
  }

  if (attributes === void 0) {
    attributes = [];
  }

  // if this tag was registered before we will return its implementation
  if (component) {
    return component({
      slots,
      attributes
    });
  } // otherwise we return a template chunk


  return create$6(slotsToMarkup(slots), [...slotBindings(slots), {
    // the attributes should be registered as binding
    // if we fallback to a normal template chunk
    expressions: attributes.map(attr => {
      return Object.assign({
        type: ATTRIBUTE
      }, attr);
    })
  }]);
}
/**
 * Merge all the slots bindings into a single array
 * @param   {Array<Object>} slots - slots collection
 * @returns {Array<Bindings>} flatten bindings array
 */


function slotBindings(slots) {
  return slots.reduce((acc, _ref) => {
    let {
      bindings
    } = _ref;
    return acc.concat(bindings);
  }, []);
}
/**
 * Merge all the slots together in a single markup string
 * @param   {Array<Object>} slots - slots collection
 * @returns {string} markup of all the slots in a single string
 */


function slotsToMarkup(slots) {
  return slots.reduce((acc, slot) => {
    return acc + slot.html;
  }, '');
}

const TagBinding = Object.seal({
  // dynamic binding properties
  // node: null,
  // evaluate: null,
  // name: null,
  // slots: null,
  // tag: null,
  // attributes: null,
  // getComponent: null,
  mount(scope) {
    return this.update(scope);
  },

  update(scope, parentScope) {
    const name = this.evaluate(scope); // simple update

    if (name === this.name) {
      this.tag.update(scope);
    } else {
      // unmount the old tag if it exists
      this.unmount(scope, parentScope, true); // mount the new tag

      this.name = name;
      this.tag = getTag(this.getComponent(name), this.slots, this.attributes);
      this.tag.mount(this.node, scope);
    }

    return this;
  },

  unmount(scope, parentScope, keepRootTag) {
    if (this.tag) {
      // keep the root tag
      this.tag.unmount(keepRootTag);
    }

    return this;
  }

});
function create$4(node, _ref2) {
  let {
    evaluate,
    getComponent,
    slots,
    attributes
  } = _ref2;
  return Object.assign({}, TagBinding, {
    node,
    evaluate,
    slots,
    attributes,
    getComponent
  });
}

var bindings = {
  [IF]: create$1,
  [SIMPLE]: create$3,
  [EACH]: create,
  [TAG]: create$4,
  [SLOT]: createSlot
};

/**
 * Text expressions in a template tag will get childNodeIndex value normalized
 * depending on the position of the <template> tag offset
 * @param   {Expression[]} expressions - riot expressions array
 * @param   {number} textExpressionsOffset - offset of the <template> tag
 * @returns {Expression[]} expressions containing the text expressions normalized
 */

function fixTextExpressionsOffset(expressions, textExpressionsOffset) {
  return expressions.map(e => e.type === TEXT ? Object.assign({}, e, {
    childNodeIndex: e.childNodeIndex + textExpressionsOffset
  }) : e);
}
/**
 * Bind a new expression object to a DOM node
 * @param   {HTMLElement} root - DOM node where to bind the expression
 * @param   {Object} binding - binding data
 * @param   {number|null} templateTagOffset - if it's defined we need to fix the text expressions childNodeIndex offset
 * @returns {Binding} Binding object
 */


function create$5(root, binding, templateTagOffset) {
  const {
    selector,
    type,
    redundantAttribute,
    expressions
  } = binding; // find the node to apply the bindings

  const node = selector ? root.querySelector(selector) : root; // remove eventually additional attributes created only to select this node

  if (redundantAttribute) node.removeAttribute(redundantAttribute);
  const bindingExpressions = expressions || []; // init the binding

  return (bindings[type] || bindings[SIMPLE])(node, Object.assign({}, binding, {
    expressions: templateTagOffset && !selector ? fixTextExpressionsOffset(bindingExpressions, templateTagOffset) : bindingExpressions
  }));
}

function createHTMLTree(html, root) {
  const template = isTemplate(root) ? root : document.createElement('template');
  template.innerHTML = html;
  return template.content;
} // for svg nodes we need a bit more work


function createSVGTree(html, container) {
  // create the SVGNode
  const svgNode = container.ownerDocument.importNode(new window.DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${html}</svg>`, 'application/xml').documentElement, true);
  return svgNode;
}
/**
 * Create the DOM that will be injected
 * @param {Object} root - DOM node to find out the context where the fragment will be created
 * @param   {string} html - DOM to create as string
 * @returns {HTMLDocumentFragment|HTMLElement} a new html fragment
 */


function createDOMTree(root, html) {
  if (isSvg(root)) return createSVGTree(html, root);
  return createHTMLTree(html, root);
}

/**
 * Inject the DOM tree into a target node
 * @param   {HTMLElement} el - target element
 * @param   {HTMLFragment|SVGElement} dom - dom tree to inject
 * @returns {undefined}
 */

function injectDOM(el, dom) {
  switch (true) {
    case isSvg(el):
      moveChildren(dom, el);
      break;

    case isTemplate(el):
      el.parentNode.replaceChild(dom, el);
      break;

    default:
      el.appendChild(dom);
  }
}

/**
 * Create the Template DOM skeleton
 * @param   {HTMLElement} el - root node where the DOM will be injected
 * @param   {string} html - markup that will be injected into the root node
 * @returns {HTMLFragment} fragment that will be injected into the root node
 */

function createTemplateDOM(el, html) {
  return html && (typeof html === 'string' ? createDOMTree(el, html) : html);
}
/**
 * Template Chunk model
 * @type {Object}
 */


const TemplateChunk = Object.freeze({
  // Static props
  // bindings: null,
  // bindingsData: null,
  // html: null,
  // isTemplateTag: false,
  // fragment: null,
  // children: null,
  // dom: null,
  // el: null,

  /**
   * Create the template DOM structure that will be cloned on each mount
   * @param   {HTMLElement} el - the root node
   * @returns {TemplateChunk} self
   */
  createDOM(el) {
    // make sure that the DOM gets created before cloning the template
    this.dom = this.dom || createTemplateDOM(el, this.html);
    return this;
  },

  // API methods

  /**
   * Attach the template to a DOM node
   * @param   {HTMLElement} el - target DOM node
   * @param   {*} scope - template data
   * @param   {*} parentScope - scope of the parent template tag
   * @param   {Object} meta - meta properties needed to handle the <template> tags in loops
   * @returns {TemplateChunk} self
   */
  mount(el, scope, parentScope, meta) {
    if (meta === void 0) {
      meta = {};
    }

    if (!el) throw new Error('Please provide DOM node to mount properly your template');
    if (this.el) this.unmount(scope); // <template> tags require a bit more work
    // the template fragment might be already created via meta outside of this call

    const {
      fragment,
      children,
      avoidDOMInjection
    } = meta; // <template> bindings of course can not have a root element
    // so we check the parent node to set the query selector bindings

    const {
      parentNode
    } = children ? children[0] : el;
    const isTemplateTag = isTemplate(el);
    const templateTagOffset = isTemplateTag ? Math.max(Array.from(parentNode.childNodes).indexOf(el), 0) : null;
    this.isTemplateTag = isTemplateTag; // create the DOM if it wasn't created before

    this.createDOM(el);

    if (this.dom) {
      // create the new template dom fragment if it want already passed in via meta
      this.fragment = fragment || this.dom.cloneNode(true);
    } // store root node
    // notice that for template tags the root note will be the parent tag


    this.el = this.isTemplateTag ? parentNode : el; // create the children array only for the <template> fragments

    this.children = this.isTemplateTag ? children || Array.from(this.fragment.childNodes) : null; // inject the DOM into the el only if a fragment is available

    if (!avoidDOMInjection && this.fragment) injectDOM(el, this.fragment); // create the bindings

    this.bindings = this.bindingsData.map(binding => create$5(this.el, binding, templateTagOffset));
    this.bindings.forEach(b => b.mount(scope, parentScope));
    return this;
  },

  /**
   * Update the template with fresh data
   * @param   {*} scope - template data
   * @param   {*} parentScope - scope of the parent template tag
   * @returns {TemplateChunk} self
   */
  update(scope, parentScope) {
    this.bindings.forEach(b => b.update(scope, parentScope));
    return this;
  },

  /**
   * Remove the template from the node where it was initially mounted
   * @param   {*} scope - template data
   * @param   {*} parentScope - scope of the parent template tag
   * @param   {boolean|null} mustRemoveRoot - if true remove the root element,
   * if false or undefined clean the root tag content, if null don't touch the DOM
   * @returns {TemplateChunk} self
   */
  unmount(scope, parentScope, mustRemoveRoot) {
    if (this.el) {
      this.bindings.forEach(b => b.unmount(scope, parentScope, mustRemoveRoot));

      switch (true) {
        // <template> tags should be treated a bit differently
        // we need to clear their children only if it's explicitly required by the caller
        // via mustRemoveRoot !== null
        case this.children && mustRemoveRoot !== null:
          clearChildren(this.children);
          break;
        // remove the root node only if the mustRemoveRoot === true

        case mustRemoveRoot === true:
          removeNode(this.el);
          break;
        // otherwise we clean the node children

        case mustRemoveRoot !== null:
          cleanNode(this.el);
          break;
      }

      this.el = null;
    }

    return this;
  },

  /**
   * Clone the template chunk
   * @returns {TemplateChunk} a clone of this object resetting the this.el property
   */
  clone() {
    return Object.assign({}, this, {
      el: null
    });
  }

});
/**
 * Create a template chunk wiring also the bindings
 * @param   {string|HTMLElement} html - template string
 * @param   {Array} bindings - bindings collection
 * @returns {TemplateChunk} a new TemplateChunk copy
 */

function create$6(html, bindings) {
  if (bindings === void 0) {
    bindings = [];
  }

  return Object.assign({}, TemplateChunk, {
    html,
    bindingsData: bindings
  });
}

function noop() {
  return this;
}
/**
 * Autobind the methods of a source object to itself
 * @param   {Object} source - probably a riot tag instance
 * @param   {Array<string>} methods - list of the methods to autobind
 * @returns {Object} the original object received
 */

function autobindMethods(source, methods) {
  methods.forEach(method => {
    source[method] = source[method].bind(source);
  });
  return source;
}
/**
 * Call the first argument received only if it's a function otherwise return it as it is
 * @param   {*} source - anything
 * @returns {*} anything
 */

function callOrAssign(source) {
  return isFunction(source) ? source.prototype && source.prototype.constructor ? new source() : source() : source;
}

/**
 * Helper function to set an immutable property
 * @param   {Object} source - object where the new property will be set
 * @param   {string} key - object key where the new property will be stored
 * @param   {*} value - value of the new property
 * @param   {Object} options - set the propery overriding the default options
 * @returns {Object} - the original object modified
 */
function defineProperty(source, key, value, options) {
  if (options === void 0) {
    options = {};
  }

  /* eslint-disable fp/no-mutating-methods */
  Object.defineProperty(source, key, Object.assign({
    value,
    enumerable: false,
    writable: false,
    configurable: true
  }, options));
  /* eslint-enable fp/no-mutating-methods */

  return source;
}
/**
 * Define multiple properties on a target object
 * @param   {Object} source - object where the new properties will be set
 * @param   {Object} properties - object containing as key pair the key + value properties
 * @param   {Object} options - set the propery overriding the default options
 * @returns {Object} the original object modified
 */

function defineProperties(source, properties, options) {
  Object.entries(properties).forEach((_ref) => {
    let [key, value] = _ref;
    defineProperty(source, key, value, options);
  });
  return source;
}
/**
 * Define default properties if they don't exist on the source object
 * @param   {Object} source - object that will receive the default properties
 * @param   {Object} defaults - object containing additional optional keys
 * @returns {Object} the original object received enhanced
 */

function defineDefaults(source, defaults) {
  Object.entries(defaults).forEach((_ref2) => {
    let [key, value] = _ref2;
    if (!source[key]) source[key] = value;
  });
  return source;
}

/**
 * Converts any DOM node/s to a loopable array
 * @param   { HTMLElement|NodeList } els - single html element or a node list
 * @returns { Array } always a loopable object
 */
function domToArray(els) {
  // can this object be already looped?
  if (!Array.isArray(els)) {
    // is it a node list?
    if (/^\[object (HTMLCollection|NodeList|Object)\]$/.test(Object.prototype.toString.call(els)) && typeof els.length === 'number') return Array.from(els);else // if it's a single node
      // it will be returned as "array" with one single entry
      return [els];
  } // this object could be looped out of the box


  return els;
}

/**
 * Simple helper to find DOM nodes returning them as array like loopable object
 * @param   { string|DOMNodeList } selector - either the query or the DOM nodes to arraify
 * @param   { HTMLElement }        ctx      - context defining where the query will search for the DOM nodes
 * @returns { Array } DOM nodes found as array
 */

function $(selector, ctx) {
  return domToArray(typeof selector === 'string' ? (ctx || document).querySelectorAll(selector) : selector);
}

/**
 * Normalize the return values, in case of a single value we avoid to return an array
 * @param   { Array } values - list of values we want to return
 * @returns { Array|string|boolean } either the whole list of values or the single one found
 * @private
 */

const normalize = values => values.length === 1 ? values[0] : values;
/**
 * Parse all the nodes received to get/remove/check their attributes
 * @param   { HTMLElement|NodeList|Array } els    - DOM node/s to parse
 * @param   { string|Array }               name   - name or list of attributes
 * @param   { string }                     method - method that will be used to parse the attributes
 * @returns { Array|string } result of the parsing in a list or a single value
 * @private
 */


function parseNodes(els, name, method) {
  const names = typeof name === 'string' ? [name] : name;
  return normalize(domToArray(els).map(el => {
    return normalize(names.map(n => el[method](n)));
  }));
}
/**
 * Set any attribute on a single or a list of DOM nodes
 * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
 * @param   { string|Object }              name  - either the name of the attribute to set
 *                                                 or a list of properties as object key - value
 * @param   { string }                     value - the new value of the attribute (optional)
 * @returns { HTMLElement|NodeList|Array } the original array of elements passed to this function
 *
 * @example
 *
 * import { set } from 'bianco.attr'
 *
 * const img = document.createElement('img')
 *
 * set(img, 'width', 100)
 *
 * // or also
 * set(img, {
 *   width: 300,
 *   height: 300
 * })
 *
 */


function set(els, name, value) {
  const attrs = typeof name === 'object' ? name : {
    [name]: value
  };
  const props = Object.keys(attrs);
  domToArray(els).forEach(el => {
    props.forEach(prop => el.setAttribute(prop, attrs[prop]));
  });
  return els;
}
/**
 * Get any attribute from a single or a list of DOM nodes
 * @param   { HTMLElement|NodeList|Array } els   - DOM node/s to parse
 * @param   { string|Array }               name  - name or list of attributes to get
 * @returns { Array|string } list of the attributes found
 *
 * @example
 *
 * import { get } from 'bianco.attr'
 *
 * const img = document.createElement('img')
 *
 * get(img, 'width') // => '200'
 *
 * // or also
 * get(img, ['width', 'height']) // => ['200', '300']
 *
 * // or also
 * get([img1, img2], ['width', 'height']) // => [['200', '300'], ['500', '200']]
 */

function get(els, name) {
  return parseNodes(els, name, 'getAttribute');
}

const CSS_BY_NAME = new Map();
const STYLE_NODE_SELECTOR = 'style[riot]'; // memoized curried function

const getStyleNode = (style => {
  return () => {
    // lazy evaluation:
    // if this function was already called before
    // we return its cached result
    if (style) return style; // create a new style element or use an existing one
    // and cache it internally

    style = $(STYLE_NODE_SELECTOR)[0] || document.createElement('style');
    set(style, 'type', 'text/css');
    /* istanbul ignore next */

    if (!style.parentNode) document.head.appendChild(style);
    return style;
  };
})();
/**
 * Object that will be used to inject and manage the css of every tag instance
 */


var cssManager = {
  CSS_BY_NAME,

  /**
   * Save a tag style to be later injected into DOM
   * @param { string } name - if it's passed we will map the css to a tagname
   * @param { string } css - css string
   * @returns {Object} self
   */
  add(name, css) {
    if (!CSS_BY_NAME.has(name)) {
      CSS_BY_NAME.set(name, css);
      this.inject();
    }

    return this;
  },

  /**
   * Inject all previously saved tag styles into DOM
   * innerHTML seems slow: http://jsperf.com/riot-insert-style
   * @returns {Object} self
   */
  inject() {
    getStyleNode().innerHTML = [...CSS_BY_NAME.values()].join('\n');
    return this;
  },

  /**
   * Remove a tag style from the DOM
   * @param {string} name a registered tagname
   * @returns {Object} self
   */
  remove(name) {
    if (CSS_BY_NAME.has(name)) {
      CSS_BY_NAME.delete(name);
      this.inject();
    }

    return this;
  }

};

/**
 * Function to curry any javascript method
 * @param   {Function}  fn - the target function we want to curry
 * @param   {...[args]} acc - initial arguments
 * @returns {Function|*} it will return a function until the target function
 *                       will receive all of its arguments
 */
function curry(fn) {
  for (var _len = arguments.length, acc = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    acc[_key - 1] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    args = [...acc, ...args];
    return args.length < fn.length ? curry(fn, ...args) : fn(...args);
  };
}

/**
 * Get the tag name of any DOM node
 * @param   {HTMLElement} element - DOM node we want to inspect
 * @returns {string} name to identify this dom node in riot
 */

function getName(element) {
  return get(element, IS_DIRECTIVE) || element.tagName.toLowerCase();
}

const COMPONENT_CORE_HELPERS = Object.freeze({
  // component helpers
  $(selector) {
    return $(selector, this.root)[0];
  },

  $$(selector) {
    return $(selector, this.root);
  }

});
const PURE_COMPONENT_API = Object.freeze({
  [MOUNT_METHOD_KEY]: noop,
  [UPDATE_METHOD_KEY]: noop,
  [UNMOUNT_METHOD_KEY]: noop
});
const COMPONENT_LIFECYCLE_METHODS = Object.freeze({
  [SHOULD_UPDATE_KEY]: noop,
  [ON_BEFORE_MOUNT_KEY]: noop,
  [ON_MOUNTED_KEY]: noop,
  [ON_BEFORE_UPDATE_KEY]: noop,
  [ON_UPDATED_KEY]: noop,
  [ON_BEFORE_UNMOUNT_KEY]: noop,
  [ON_UNMOUNTED_KEY]: noop
});
const MOCKED_TEMPLATE_INTERFACE = Object.assign({}, PURE_COMPONENT_API, {
  clone: noop,
  createDOM: noop
});
/**
 * Evaluate the component properties either from its real attributes or from its initial user properties
 * @param   {HTMLElement} element - component root
 * @param   {Object}  initialProps - initial props
 * @returns {Object} component props key value pairs
 */

function evaluateInitialProps(element, initialProps) {
  if (initialProps === void 0) {
    initialProps = {};
  }

  return Object.assign({}, DOMattributesToObject(element), callOrAssign(initialProps));
}
/**
 * Bind a DOM node to its component object
 * @param   {HTMLElement} node - html node mounted
 * @param   {Object} component - Riot.js component object
 * @returns {Object} the component object received as second argument
 */


const bindDOMNodeToComponentObject = (node, component) => node[DOM_COMPONENT_INSTANCE_PROPERTY] = component;
/**
 * Wrap the Riot.js core API methods using a mapping function
 * @param   {Function} mapFunction - lifting function
 * @returns {Object} an object having the { mount, update, unmount } functions
 */


function createCoreAPIMethods(mapFunction) {
  return [MOUNT_METHOD_KEY, UPDATE_METHOD_KEY, UNMOUNT_METHOD_KEY].reduce((acc, method) => {
    acc[method] = mapFunction(method);
    return acc;
  }, {});
}
/**
 * Factory function to create the component templates only once
 * @param   {Function} template - component template creation function
 * @param   {Object} components - object containing the nested components
 * @returns {TemplateChunk} template chunk object
 */


function componentTemplateFactory(template, components) {
  return template(create$6, expressionTypes, bindingTypes, name => {
    return components[name] || COMPONENTS_IMPLEMENTATION_MAP.get(name);
  });
}
/**
 * Create a pure component
 * @param   {Function} pureFactoryFunction - pure component factory function
 * @param   {Array} options.slots - component slots
 * @param   {Array} options.attributes - component attributes
 * @param   {Array} options.template - template factory function
 * @param   {Array} options.template - template factory function
 * @param   {any} options.props - initial component properties
 * @returns {Object} pure component object
 */


function createPureComponent(pureFactoryFunction, _ref) {
  let {
    slots,
    attributes,
    props,
    css,
    template
  } = _ref;
  if (template) panic('Pure components can not have html');
  if (css) panic('Pure components do not have css');
  const component = defineDefaults(pureFactoryFunction({
    slots,
    attributes,
    props
  }), PURE_COMPONENT_API);
  return createCoreAPIMethods(method => function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    // intercept the mount calls to bind the DOM node to the pure object created
    // see also https://github.com/riot/riot/issues/2806
    if (method === MOUNT_METHOD_KEY) {
      const [el] = args;
      bindDOMNodeToComponentObject(el, component);
    }

    component[method](...args);
    return component;
  });
}
/**
 * Create the component interface needed for the @riotjs/dom-bindings tag bindings
 * @param   {string} options.css - component css
 * @param   {Function} options.template - functon that will return the dom-bindings template function
 * @param   {Object} options.exports - component interface
 * @param   {string} options.name - component name
 * @returns {Object} component like interface
 */


function createComponent(_ref2) {
  let {
    css,
    template,
    exports,
    name
  } = _ref2;
  const templateFn = template ? componentTemplateFactory(template, exports ? createSubcomponents(exports.components) : {}) : MOCKED_TEMPLATE_INTERFACE;
  return (_ref3) => {
    let {
      slots,
      attributes,
      props
    } = _ref3;
    // pure components rendering will be managed by the end user
    if (exports && exports[IS_PURE_SYMBOL]) return createPureComponent(exports, {
      slots,
      attributes,
      props,
      css,
      template
    });
    const componentAPI = callOrAssign(exports) || {};
    const component = defineComponent({
      css,
      template: templateFn,
      componentAPI,
      name
    })({
      slots,
      attributes,
      props
    }); // notice that for the components create via tag binding
    // we need to invert the mount (state/parentScope) arguments
    // the template bindings will only forward the parentScope updates
    // and never deal with the component state

    return {
      mount(element, parentScope, state) {
        return component.mount(element, state, parentScope);
      },

      update(parentScope, state) {
        return component.update(state, parentScope);
      },

      unmount(preserveRoot) {
        return component.unmount(preserveRoot);
      }

    };
  };
}
/**
 * Component definition function
 * @param   {Object} implementation - the componen implementation will be generated via compiler
 * @param   {Object} component - the component initial properties
 * @returns {Object} a new component implementation object
 */

function defineComponent(_ref4) {
  let {
    css,
    template,
    componentAPI,
    name
  } = _ref4;
  // add the component css into the DOM
  if (css && name) cssManager.add(name, css);
  return curry(enhanceComponentAPI)(defineProperties( // set the component defaults without overriding the original component API
  defineDefaults(componentAPI, Object.assign({}, COMPONENT_LIFECYCLE_METHODS, {
    [STATE_KEY]: {}
  })), Object.assign({
    // defined during the component creation
    [SLOTS_KEY]: null,
    [ROOT_KEY]: null
  }, COMPONENT_CORE_HELPERS, {
    name,
    css,
    template
  })));
}
/**
 * Create the bindings to update the component attributes
 * @param   {HTMLElement} node - node where we will bind the expressions
 * @param   {Array} attributes - list of attribute bindings
 * @returns {TemplateChunk} - template bindings object
 */

function createAttributeBindings(node, attributes) {
  if (attributes === void 0) {
    attributes = [];
  }

  const expressions = attributes.map(a => create$2(node, a));
  const binding = {};
  return Object.assign(binding, Object.assign({
    expressions
  }, createCoreAPIMethods(method => scope => {
    expressions.forEach(e => e[method](scope));
    return binding;
  })));
}
/**
 * Create the subcomponents that can be included inside a tag in runtime
 * @param   {Object} components - components imported in runtime
 * @returns {Object} all the components transformed into Riot.Component factory functions
 */


function createSubcomponents(components) {
  if (components === void 0) {
    components = {};
  }

  return Object.entries(callOrAssign(components)).reduce((acc, _ref5) => {
    let [key, value] = _ref5;
    acc[camelToDashCase(key)] = createComponent(value);
    return acc;
  }, {});
}
/**
 * Run the component instance through all the plugins set by the user
 * @param   {Object} component - component instance
 * @returns {Object} the component enhanced by the plugins
 */


function runPlugins(component) {
  return [...PLUGINS_SET].reduce((c, fn) => fn(c) || c, component);
}
/**
 * Compute the component current state merging it with its previous state
 * @param   {Object} oldState - previous state object
 * @param   {Object} newState - new state givent to the `update` call
 * @returns {Object} new object state
 */


function computeState(oldState, newState) {
  return Object.assign({}, oldState, callOrAssign(newState));
}
/**
 * Add eventually the "is" attribute to link this DOM node to its css
 * @param {HTMLElement} element - target root node
 * @param {string} name - name of the component mounted
 * @returns {undefined} it's a void function
 */


function addCssHook(element, name) {
  if (getName(element) !== name) {
    set(element, IS_DIRECTIVE, name);
  }
}
/**
 * Component creation factory function that will enhance the user provided API
 * @param   {Object} component - a component implementation previously defined
 * @param   {Array} options.slots - component slots generated via riot compiler
 * @param   {Array} options.attributes - attribute expressions generated via riot compiler
 * @returns {Riot.Component} a riot component instance
 */


function enhanceComponentAPI(component, _ref6) {
  let {
    slots,
    attributes,
    props
  } = _ref6;
  return autobindMethods(runPlugins(defineProperties(Object.create(component), {
    mount(element, state, parentScope) {
      if (state === void 0) {
        state = {};
      }

      this[ATTRIBUTES_KEY_SYMBOL] = createAttributeBindings(element, attributes).mount(parentScope);
      defineProperty(this, PROPS_KEY, Object.freeze(Object.assign({}, evaluateInitialProps(element, props), evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions))));
      this[STATE_KEY] = computeState(this[STATE_KEY], state);
      this[TEMPLATE_KEY_SYMBOL] = this.template.createDOM(element).clone(); // link this object to the DOM node

      bindDOMNodeToComponentObject(element, this); // add eventually the 'is' attribute

      component.name && addCssHook(element, component.name); // define the root element

      defineProperty(this, ROOT_KEY, element); // define the slots array

      defineProperty(this, SLOTS_KEY, slots); // before mount lifecycle event

      this[ON_BEFORE_MOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
      this[PARENT_KEY_SYMBOL] = parentScope; // mount the template

      this[TEMPLATE_KEY_SYMBOL].mount(element, this, parentScope);
      this[ON_MOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);
      return this;
    },

    update(state, parentScope) {
      if (state === void 0) {
        state = {};
      }

      if (parentScope) {
        this[PARENT_KEY_SYMBOL] = parentScope;
        this[ATTRIBUTES_KEY_SYMBOL].update(parentScope);
      }

      const newProps = evaluateAttributeExpressions(this[ATTRIBUTES_KEY_SYMBOL].expressions);
      if (this[SHOULD_UPDATE_KEY](newProps, this[PROPS_KEY]) === false) return;
      defineProperty(this, PROPS_KEY, Object.freeze(Object.assign({}, this[PROPS_KEY], newProps)));
      this[STATE_KEY] = computeState(this[STATE_KEY], state);
      this[ON_BEFORE_UPDATE_KEY](this[PROPS_KEY], this[STATE_KEY]);
      this[TEMPLATE_KEY_SYMBOL].update(this, this[PARENT_KEY_SYMBOL]);
      this[ON_UPDATED_KEY](this[PROPS_KEY], this[STATE_KEY]);
      return this;
    },

    unmount(preserveRoot) {
      this[ON_BEFORE_UNMOUNT_KEY](this[PROPS_KEY], this[STATE_KEY]);
      this[ATTRIBUTES_KEY_SYMBOL].unmount(); // if the preserveRoot is null the template html will be left untouched
      // in that case the DOM cleanup will happen differently from a parent node

      this[TEMPLATE_KEY_SYMBOL].unmount(this, this[PARENT_KEY_SYMBOL], preserveRoot === null ? null : !preserveRoot);
      this[ON_UNMOUNTED_KEY](this[PROPS_KEY], this[STATE_KEY]);
      return this;
    }

  })), Object.keys(component).filter(prop => isFunction(component[prop])));
}

/**
 * Similar to compose but performs from left-to-right function composition.<br/>
 * {@link https://30secondsofcode.org/function#composeright see also}
 * @param   {...[function]} fns) - list of unary function
 * @returns {*} result of the computation
 */
/**
 * Performs right-to-left function composition.<br/>
 * Use Array.prototype.reduce() to perform right-to-left function composition.<br/>
 * The last (rightmost) function can accept one or more arguments; the remaining functions must be unary.<br/>
 * {@link https://30secondsofcode.org/function#compose original source code}
 * @param   {...[function]} fns) - list of unary function
 * @returns {*} result of the computation
 */

function compose() {
  for (var _len2 = arguments.length, fns = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    fns[_key2] = arguments[_key2];
  }

  return fns.reduce((f, g) => function () {
    return f(g(...arguments));
  });
}
/**
 * Helper method to create component without relying on the registered ones
 * @param   {Object} implementation - component implementation
 * @returns {Function} function that will allow you to mount a riot component on a DOM node
 */

function component(implementation) {
  return function (el, props, _temp) {
    let {
      slots,
      attributes,
      parentScope
    } = _temp === void 0 ? {} : _temp;
    return compose(c => c.mount(el, parentScope), c => c({
      props,
      slots,
      attributes
    }), createComponent)(implementation);
  };
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var observable = createCommonjsModule(function (module, exports) {
(function(window, undefined$1) {const ALL_CALLBACKS = '*';
const define = Object.defineProperties;
const entries = Object.entries;

const on = (callbacks, el) => (event, fn) => {
  if (callbacks.has(event)) {
    callbacks.get(event).add(fn);
  } else {
    callbacks.set(event, new Set().add(fn));
  }

  return el
};

const off = (callbacks, el) => (event, fn) => {
  if (event === ALL_CALLBACKS && !fn) {
    callbacks.clear();
  } else {
    if (fn) {
      const fns = callbacks.get(event);

      if (fns) {
        fns.delete(fn);
        if (fns.size === 0) callbacks.delete(event);
      }
    } else callbacks.delete(event);
  }
  return el
};

const one = (callbacks, el) => (event, fn) => {
  function on(...args) {
    el.off(event, on);
    fn.apply(el, args);
  }
  return el.on(event, on)
};

const trigger = (callbacks, el) => (event, ...args) => {
  const fns = callbacks.get(event);

  if (fns) fns.forEach(fn => fn.apply(el, args));

  if (callbacks.get(ALL_CALLBACKS) && event !== ALL_CALLBACKS) {
    el.trigger(ALL_CALLBACKS, event, ...args);
  }

  return el
};

const observable = function(el) { // eslint-disable-line
  const callbacks = new Map();
  const methods = {on, off, one, trigger};

  el = el || {};

  define(el,
    entries(methods).reduce((acc, [key, method]) => {
      acc[key] = {
        value: method(callbacks, el),
        enumerable: false,
        writable: false,
        configurable: false
      };

      return acc
    }, {})
  );

  return el
};
  /* istanbul ignore next */
  // support CommonJS, AMD & browser
  module.exports = observable;

})();
});

var gameContractABI = {
  ABI: [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "baseHealth",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "attackCost",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "attackPoints",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "apPM",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "maxInventorySize",
          "type": "uint32"
        },
        {
          "internalType": "contract CryptoFighterToken",
          "name": "tokenContract",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "attacker",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "defender",
          "type": "address"
        }
      ],
      "name": "FightLost",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "attacker",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "defender",
          "type": "address"
        }
      ],
      "name": "FightWon",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "slot",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "item",
          "type": "uint64"
        }
      ],
      "name": "ItemBought",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint64",
          "name": "id",
          "type": "uint64"
        }
      ],
      "name": "ItemCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bool",
          "name": "value",
          "type": "bool"
        }
      ],
      "name": "PlayerRegistrationStatus",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        }
      ],
      "name": "PlayerSpawned",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "TokenPriceChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokenSupplied",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "actionPoints",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newMod",
          "type": "address"
        }
      ],
      "name": "addModerator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "addOwner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "attackCost",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "attackPointsPerMinute",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "baseHealth",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "mod",
          "type": "address"
        }
      ],
      "name": "fireModerator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_player",
          "type": "address"
        }
      ],
      "name": "getArmorArms",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_player",
          "type": "address"
        }
      ],
      "name": "getArmorChest",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_player",
          "type": "address"
        }
      ],
      "name": "getArmorHead",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_player",
          "type": "address"
        }
      ],
      "name": "getArmorPants",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_player",
          "type": "address"
        }
      ],
      "name": "getArmorShoes",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "id",
          "type": "uint64"
        }
      ],
      "name": "getItemAttack",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "id",
          "type": "uint64"
        }
      ],
      "name": "getItemDefense",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "id",
          "type": "uint64"
        }
      ],
      "name": "getItemHealth",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "id",
          "type": "uint64"
        }
      ],
      "name": "getItemName",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "id",
          "type": "uint64"
        }
      ],
      "name": "getItemSlot",
      "outputs": [
        {
          "internalType": "enum CFItemBase.EquipmentSlot",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getLosses",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getNewPlayerArmorArms",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getNewPlayerArmorChest",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getNewPlayerArmorHead",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getNewPlayerArmorPants",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getNewPlayerArmorShoes",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "getNotClaimedActionPoints",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "id",
          "type": "uint64"
        }
      ],
      "name": "getShopPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        }
      ],
      "name": "getWins",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "slot",
          "type": "uint256"
        }
      ],
      "name": "inventory",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "inventorySize",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "isMod",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "isOwner",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "isPlayer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "id",
          "type": "uint64"
        }
      ],
      "name": "isShopItem",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "maximumItemID",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "refreshAttackPoints",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "retireModerator",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "retireOwner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "startAttackPoints",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "tokenPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "slot",
          "type": "uint256"
        }
      ],
      "name": "trashItem",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_enemy",
          "type": "address"
        }
      ],
      "name": "attack",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_price",
          "type": "uint256"
        }
      ],
      "name": "setTokenPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "buyToken",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_from",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_value",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "_data",
          "type": "bytes"
        }
      ],
      "name": "tokenFallback",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "value",
          "type": "bool"
        }
      ],
      "name": "setCreatePlayers",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "canCreateNewPlayers",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "inventorySlot",
          "type": "uint256"
        }
      ],
      "name": "equipItem",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "slot",
          "type": "uint256"
        },
        {
          "internalType": "uint32",
          "name": "attack",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "defense",
          "type": "uint32"
        },
        {
          "internalType": "uint32",
          "name": "health",
          "type": "uint32"
        },
        {
          "internalType": "bool",
          "name": "shopItem",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "shopPrice",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        }
      ],
      "name": "createItem",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "head",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "chest",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "arms",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "pants",
          "type": "uint64"
        },
        {
          "internalType": "uint64",
          "name": "shoes",
          "type": "uint64"
        }
      ],
      "name": "setNewPlayerTemplate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "createNewPlayer",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_player",
          "type": "address"
        }
      ],
      "name": "getAttackOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_player",
          "type": "address"
        }
      ],
      "name": "getDefenseOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_player",
          "type": "address"
        }
      ],
      "name": "getHealthOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "tokenContractAddress",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "_receiver",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_amount",
          "type": "uint256"
        }
      ],
      "name": "payout",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "baseHealth",
          "type": "uint256"
        }
      ],
      "name": "setBaseHealth",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "attackCost",
          "type": "uint256"
        }
      ],
      "name": "setAttackCost",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "startAttackPoints",
          "type": "uint256"
        }
      ],
      "name": "setStartAttackPoints",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "apM",
          "type": "uint256"
        }
      ],
      "name": "setAttackPointsPerMinute",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "size",
          "type": "uint32"
        }
      ],
      "name": "setInventorySize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract CryptoFighterToken",
          "name": "tokenContract",
          "type": "address"
        }
      ],
      "name": "setCryptoFighterTokenAddress",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};

var tokenContractABI = {
  ABI: [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "MinterAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "MinterRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "addMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "isMinter",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceMinter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]};

function AlertBox(id, option) {
  this.show = function(msg) {
    if (msg === ''  || typeof msg === 'undefined' || msg === null) {
      throw '"msg parameter is empty"';
    }
    else {
      const alertArea = document.querySelector(id);
      const alertBox = document.createElement('DIV');
      const alertContent = document.createElement('DIV');
      const alertClose = document.createElement('A');
      const alertClass = this;
      alertContent.classList.add('alert-content');
      alertContent.innerText = msg;
      alertClose.classList.add('alert-close');
      alertClose.setAttribute('href', '#');
      alertBox.classList.add('alert-box');
      alertBox.appendChild(alertContent);
      if (!option.hideCloseButton || typeof option.hideCloseButton === 'undefined') {
        alertBox.appendChild(alertClose);
      }
      alertArea.appendChild(alertBox);
      alertClose.addEventListener('click', function(event) {
        event.preventDefault();
        alertClass.hide(alertBox);
      });
      if (!option.persistent) {
        const alertTimeout = setTimeout(function() {
          alertClass.hide(alertBox);
          clearTimeout(alertTimeout);
        }, option.closeTime);
      }
    }
  };

  this.hide = function(alertBox) {
    alertBox.classList.add('hide');
    const disperseTimeout = setTimeout(function() {
      alertBox.parentNode.removeChild(alertBox);
      clearTimeout(disperseTimeout);
    }, 500);
  };
}

function showError(error) {
  new AlertBox("#alert-area", {
    closeTime: 3000,
    persistent: false,
    hideCloseButton: false
  }).show(error);
}

function slotToName(slot) {
  switch (slot) {
    case 0: return "Head"
    case 1: return "Chest"
    case 2: return "Arms"
    case 3: return "Pants"
    case 4: return "Shoes"
    default:
      return slot
  }
}

function materializeAll(start, end, f) {
  const array = [];

  for(let i=start; i<end; i++) {
    array.push(f(i));
  }

  return array
}

Array.prototype.contains = function(f) {
  for (const element of this) {
    if (f(element))
      return true
  }

  return false
};

const contractInstances = { game: null, token: null };
const filters = { tx: new Map() };
const contractEvents  = observable();
const knownPlayers = [];

let lastTokenPrice = 0;
let itemsCache = null;

class GameContractService {

  events = contractEvents
  knownPlayers = knownPlayers

  self() { return web3.eth.defaultAccount }
  gameAddress() { return contractInstances.game.address.toLowerCase() }
  changeSelf(to) {
    web3.eth.defaultAccount = to;
    this.events.trigger('player-changed', to);
  }

  canCreateNewPlayers() { return contractInstances.game.canCreateNewPlayers.call() }

  isPlayer() { return contractInstances.game.isPlayer.call() }
  isOwner()  { return contractInstances.game.isOwner.call()  }
  isModerator() { return contractInstances.game.isMod.call() }
  inventorySize() { return contractInstances.game.inventorySize.call() }
  inventory(slot) { return contractInstances.game.inventory.call(slot) }
  equipItem(slot) { return handleTransaction(contractInstances.game.equipItem, slot) }
  trashItem(slot) { return handleTransaction(contractInstances.game.trashItem, slot) }
  buyTokens(tokens) {
    if (lastTokenPrice === 0) {
      lastTokenPrice = this.tokenPrice();
    }

    const value = lastTokenPrice.mul(Number(tokens));
    return handleTransaction(contractInstances.game.buyToken, {value: value})
  }

  payout(address, amount) { return handleTransaction(contractInstances.game.payout, address, amount)}

  getMaxItemID() { return contractInstances.game.maximumItemID.call() }
  getItemName(id) { return contractInstances.game.getItemName.call(id) }
  getItem(id) {
    return {
      id: id,
      slot: slotToName(contractInstances.game.getItemSlot.call(id).toNumber()),
      attack: contractInstances.game.getItemAttack.call(id),
      defense: contractInstances.game.getItemDefense.call(id),
      health: contractInstances.game.getItemHealth.call(id),
      isShop: contractInstances.game.isShopItem.call(id),
      price: contractInstances.game.getShopPrice.call(id),
      name: contractInstances.game.getItemName.call(id)
    }
  }
  getAllItems() {
    if (itemsCache === null)
      itemsCache = materializeAll(1, this.getMaxItemID(), this.getItem);

    return itemsCache
  }
  getInventory() { return materializeAll(0, this.inventorySize(), this.inventory) }

  createItem(item) {return handleTransaction(contractInstances.game.createItem, item.slot, item.attack, item.defense, item.health, item.isShop, item.price, item.name) }
  buyItem(item) {
    const encodedParameter = "0x" + web3.padLeft(web3.toHex(item.id).slice(2), 2);
    return handleTransaction(
        contractInstances.token.transfer['address,uint256,bytes'],
        contractInstances.game.address, item.price,
        encodedParameter
    )
  }

  tokenSymbol() { return contractInstances.token.symbol.call() }
  tokenName()   { return contractInstances.token.name.call()   }
  tokenBalanceOf(addr) { return contractInstances.token.balanceOf.call(addr) }
  tokenBalanceOfSelf() { return contractInstances.token.balanceOf.call(this.self())}
  tokenBalanceOfGame() { return contractInstances.token.balanceOf.call(contractInstances.game.address) }
  tokenSupply() { return contractInstances.token.totalSupply.call() }
  canMintToken(address) { return contractInstances.token.isMinter.call(address) }

  tokenContractAddress() { return contractInstances.game.tokenContractAddress.call() }
  tokenPrice()  { return contractInstances.game.tokenPrice.call() }
  mintTokens(amount) { return handleTransaction(contractInstances.token.mint, contractInstances.game.address, amount)}
  setTokenPrice(price) { return handleTransaction(contractInstances.game.setTokenPrice, price) }
  setCreatePlayers(value) { return handleTransaction(contractInstances.game.setCreatePlayers, value) }
  createPlayer() { return handleTransaction(contractInstances.game.createNewPlayer) }

  getAttackOf(player) { return contractInstances.game.getAttackOf.call(player) }
  getAttackOfSelf()   { return contractInstances.game.getAttackOf.call(this.self()) }
  getDefenseOf(player) { return contractInstances.game.getDefenseOf.call(player) }
  getDefenseOfSelf()   { return contractInstances.game.getDefenseOf.call(this.self()) }
  getHealthOf(player) { return contractInstances.game.getHealthOf.call(player) }
  getHealthOfSelf()   { return contractInstances.game.getHealthOf.call(this.self()) }

  getArmorHead(player) { return contractInstances.game.getArmorHead.call(player) }
  getArmorHeadSelf() { return contractInstances.game.getArmorHead.call(this.self()) }
  getArmorChest(player) { return contractInstances.game.getArmorArms.call(player) }
  getArmorChestSelf() { return contractInstances.game.getArmorArms.call(this.self()) }
  getArmorArms(player) { return contractInstances.game.getArmorChest.call(player) }
  getArmorArmsSelf() { return contractInstances.game.getArmorChest.call(this.self()) }
  getArmorPants(player) { return contractInstances.game.getArmorPants.call(player) }
  getArmorPantsSelf() { return contractInstances.game.getArmorPants.call(this.self()) }
  getArmorShoes(player) { return contractInstances.game.getArmorShoes.call(player) }
  getArmorShoesSelf() { return contractInstances.game.getArmorShoes.call(this.self()) }

  getWins(player) { return contractInstances.game.getWins(player) }
  getWinsSelf() { return contractInstances.game.getWins(this.self()) }
  getLosses(player) { return contractInstances.game.getLosses(player) }
  getLossesSelf() { return contractInstances.game.getLosses(this.self()) }

  getPlayerStats(player) {
    return {
      id: player,
      attack: this.getAttackOf(player),
      defense: this.getDefenseOf(player),
      health: this.getHealthOf(player)
    }
  }

  getPlayer(player) {
    return {
      id: player,
      head: contractInstances.game.getArmorHead.call(player),
      arms: contractInstances.game.getArmorArms.call(player),
      chest: contractInstances.game.getArmorChest.call(player),
      pants: contractInstances.game.getArmorPants.call(player),
      shoes: contractInstances.game.getArmorShoes.call(player),
    }
  }

  getPlayerSelf() { return this.getPlayer(this.self()) }
  setPlayerTemplate(head, chest, arms, pants, shoes) {
    return handleTransaction(contractInstances.game.setNewPlayerTemplate, head, chest, arms, pants, shoes)
  }

  attack(other) { return handleTransaction(contractInstances.game.attack, other, {eGas: 1000}) }
  actionPoints() { return contractInstances.game.actionPoints.call() }
  refreshAP() { return handleTransaction(contractInstances.game.refreshAttackPoints) }
  getNotClaimedActionPoints() { return contractInstances.game.getNotClaimedActionPoints.call() }

  addOwner(address) { return handleTransaction(contractInstances.game.addOwner, address) }
  addModerator(address) { return handleTransaction(contractInstances.game.addModerator, address) }
  renounceOwner() { return handleTransaction(contractInstances.game.retireOwner) }
  renounceModerator() { return handleTransaction(contractInstances.game.retireModerator) }
  fireModerator(address) { return handleTransaction(contractInstances.game.fireModerator, address)}

  getNewPlayerArmorHead() { return contractInstances.game.getNewPlayerArmorHead.call() }
  getNewPlayerArmorChest()  { return contractInstances.game.getNewPlayerArmorChest.call() }
  getNewPlayerArmorArms()  { return contractInstances.game.getNewPlayerArmorArms.call() }
  getNewPlayerArmorPants()  { return contractInstances.game.getNewPlayerArmorPants.call() }
  getNewPlayerArmorShoes()  { return contractInstances.game.getNewPlayerArmorShoes.call() }

  searchForPlayers(blocks, exclude) {
    const latest = web3.eth.blockNumber;
    const from   = Math.max(0, latest-blocks);

    return Promise.all([
      getAllEventsFor('PlayerSpawned', from, latest, (entry) => {return entry.args.from}),
      getAllEventsFor('FightWon', from, latest, (entry) => {return entry.args.attacker}),
      getAllEventsFor('FightLost', from, latest, (entry) => {return entry.args.attacker}),
    ]).then((players) => {
      const ex  = new Set(exclude);
      const res = new Set();

      for(const address of players[0]) if (!ex.has(address)) res.add(address);
      for(const address of players[1]) if (!ex.has(address)) res.add(address);
      for(const address of players[2]) if (!ex.has(address)) res.add(address);

      return res
    })
  }

}

function loadGameContract(__address__) {
  console.log("LOADING Contracts ...");

  let address = null;
  if (__address__ === undefined) {
    address = window.localStorage.getItem("game-contract");
  } else {
    address = __address__;
  }

  if (!web3.isAddress(address))
    throw "No contract address was set!"

  const gameContract  = web3.eth.contract(gameContractABI.ABI);
  const tokenContract = web3.eth.contract(tokenContractABI.ABI);

  const gameContractI  = gameContract.at(address);
  const tokenAddress   = gameContractI.tokenContractAddress.call();
  if (!web3.isAddress(tokenAddress))
    throw "Can not query token address from contract!"

  const tokenContractI = tokenContract.at(tokenAddress);

  contractInstances.game  = gameContractI;
  contractInstances.token = tokenContractI;

  // Setup web3 filters:
  web3.eth.filter('latest', function(error, result) {
    if (error) console.error(error);
    else {
      const block = web3.eth.getBlock(result, true);
      for (const tx of block.transactions) {
        if(filters.tx.has(tx.hash)) {
          console.log(tx.hash + ' has been mined');

          filters.tx.get(tx.hash)(tx);
          filters.tx.delete(tx.hash);
        }
      }
    }
  });

  setupEventListener(contractInstances.game, 'ItemCreated');
  setupEventListener(contractInstances.game, 'PlayerSpawned');
  setupFilteredEventListener(contractInstances.game, 'FightWon', (event) => {
    return event.attacker === web3.eth.defaultAccount || event.defender === web3.eth.defaultAccount
  });
  setupFilteredEventListener(contractInstances.game, 'FightLost', (event) => {
    return event.attacker === web3.eth.defaultAccount || event.defender === web3.eth.defaultAccount
  });
  setupEventListener(contractInstances.game, 'TokenSupplied');
  setupEventListener(contractInstances.game, 'ItemBought');
  setupEventListener(contractInstances.game, 'TokenPriceChanged');
  setupFilteredEventListener(contractInstances.token, 'Transfer', (event) => {
    return event.from === web3.eth.defaultAccount || event.to === web3.eth.defaultAccount
  });
  setupEventListener(contractInstances.game, 'PlayerRegistrationStatus');
  setupEventListener(contractInstances.game, 'PlayerSpawned');

  contractEvents.on('TokenPriceChanged', (event) => {
    lastTokenPrice = event.price;
  });

  contractEvents.on('ItemCreated', (event) => {
    itemsCache = null;
  });

  contractEvents.on('PlayerSpawned', (event) => {
    knownPlayers.push(event.from);
  });

  console.debug("Initialization done!");
}

function setupEventListener(contract, name) {
  contract[name]({}).watch(function (error, result) {
    if (error) console.error(error);
    else contractEvents.trigger(name, {...result.args});
  });
}

function setupFilteredEventListener(contract, name, filter) {
  contract[name]({}).watch(function (error, result) {
    if (error) console.error(error);
    else if (filter({...result.args})) contractEvents.trigger(name, {...result.args});
  });
}

function getAllEventsFor(event, from, to, f) {
  const eventResults = [];

  return new Promise((resolve, reject) => {
    contractInstances.game[event]({}, {fromBlock: from, toBlock: to }).get((error, result) => {
      if (error) reject(error);
      else for (const entry of result) {
        eventResults.push(f(entry));
      }

      resolve(eventResults);
    });
  })
}

function handleTransaction(f, ...params) {
  return new Promise((resolve, reject) => {
    let transactionProps = {};
    let transactionParams = [];

    if (params.length > 0) {
      const lastElement = params[params.length-1];
      if (typeof lastElement === 'object' && (lastElement.value !== undefined || lastElement.from !== undefined || lastElement.eGas !== undefined)) {
        transactionProps  = {...transactionProps, ...lastElement};
        transactionParams = params.slice(0, params.length-1);
      } else {
        transactionParams = params;
      }
    }

    const transactionPropsBackup = {...transactionProps};
    f.estimateGas(...transactionParams, transactionProps, (error, gas) => {
      if (error) {
        showError("Estimate GAS:\n" + error);
        reject(error);
      } else {
        new AlertBox("#alert-area", {
          closeTime: 3000,
          persistent: false,
          hideCloseButton: false
        }).show(`Used ${gas} wei as gas for transaction`);

        let eGas = 0; if (transactionPropsBackup.eGas === undefined) eGas = 0; else eGas = transactionPropsBackup.eGas;
        transactionProps = {...transactionProps, gas: (gas + eGas)};
        f.sendTransaction(...transactionParams, transactionProps, (error, result) => {
          if (error) {
            showError(error);
            reject(error);
          } else {
            new AlertBox("#alert-area", {
              closeTime: 2000,
              persistent: false,
              hideCloseButton: false
            }).show(`Transaction was successful!`);
            filters.tx.set(result, resolve);
          }
        });
      }
    });
  });
}

const game$8 = new GameContractService();

var AppHeader = {
  'css': null,

  'exports': {
    state: {
      gameAddress: window.localStorage.getItem("game-contract"),
      accounts: "",
      active: ""
    },

    onAccountChanged(event) {
      this.props.observable.trigger('account-changed', event.target.value);
      game$8.changeSelf(event.target.value);
    },

    onBeforeMount() {
      this.state.active = web3.eth.defaultAccount;
      this.state.accounts = web3.eth.accounts;

      this.props.observable.on('new-contract', () => {
        this.update({
          gameAddress: window.localStorage.getItem("game-contract")
        });
      });
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<header class="header"><div class="home-menu pure-menu pure-menu-horizontal pure-menu-fixed"><a class="pure-menu-heading">Crypto Fighter</a><small expr3="expr3" style="color:#7f8c8d"> </small><ul class="pure-menu-list"><li class="pure-menu-item" style="padding: .5em 1em"><label for="accounts" style="color:#AAA;padding-right:1em">Your Accounts:</label><select expr4="expr4" id="accounts"><option expr5="expr5"></option></select></li></ul></div></header>',
      [{
        'redundantAttribute': 'expr3',
        'selector': '[expr3]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return ['(', scope.state.gameAddress, ')'].join('');
          }
        }]
      }, {
        'redundantAttribute': 'expr4',
        'selector': '[expr4]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onchange',

          'evaluate': function(scope) {
            return scope.onAccountChanged;
          }
        }]
      }, {
        'type': bindingTypes.EACH,
        'getKey': null,
        'condition': null,

        'template': template(' ', [{
          'expressions': [{
            'type': expressionTypes.TEXT,
            'childNodeIndex': 0,

            'evaluate': function(scope) {
              return scope.account;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'value',

            'evaluate': function(scope) {
              return scope.account;
            }
          }, {
            'type': expressionTypes.ATTRIBUTE,
            'name': 'selected',

            'evaluate': function(scope) {
              return scope.account==scope.state.active;
            }
          }]
        }]),

        'redundantAttribute': 'expr5',
        'selector': '[expr5]',
        'itemName': 'account',
        'indexName': null,

        'evaluate': function(scope) {
          return scope.state.accounts;
        }
      }]
    );
  },

  'name': 'app-header'
};

var NewContract = {
  'css': null,

  'exports': {
    observable: null,

    onClick(e) {
      e.preventDefault();
      const address = this.$('#aligned-name').value;

      if (web3.isAddress(address)) {

        try {
          loadGameContract(address);
          window.localStorage.setItem("game-contract", address);
          this.props.observable.trigger('new-contract');
        } catch(error) {
          console.error(error);
          showError("An error occurred while adding the Contract:\n\n" + error);
        }

      } else alert("Please enter a valid address");
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<div class="pure-g"><div class="pure-u-1 pure-u-md-1-3"></div><div class="pure-u-1 pure-u-md-1-3"><form class="pure-form pure-form-aligned"><h2>Search for Crypto Fighter contract</h2><fieldset><div class="pure-control-group"><label for="aligned-name">Contract Address</label><input type="text" id="aligned-name" placeholder="0x0000000000000000000000000000000000000000"/><span class="pure-form-message-inline">This is a required field.</span></div><div class="pure-controls"><button expr6="expr6" type="submit" class="pure-button pure-button-primary">Load Contract</button></div></fieldset></form></div><div class="pure-u-1 pure-u-md-1-3"></div></div>',
      [{
        'redundantAttribute': 'expr6',
        'selector': '[expr6]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.onClick;
          }
        }]
      }]
    );
  },

  'name': 'new-contract'
};

const game$7 = new GameContractService();

var NewPlayer = {
  'css': null,

  'exports': {
    state: {
      address: '',
      canCreateAccount: true,
    },

    observable: null,
    contract: null,

    onBeforeMount() {
      this.state.address = window.localStorage.getItem("game-contract");
      this.state.canCreateAccount = game$7.canCreateNewPlayers();

      game$7.events.on('PlayerRegistrationStatus', this.onRegisterStatusChanged);
    },

    onRegisterStatusChanged(event) {
      this.update({
        canCreateAccount: event.value
      });
    },

    onUnmounted() {
       game$7.events.off('PlayerRegistrationStatus', this.onRegisterStatusChanged);
    },

    onClick(e) {
      e.preventDefault();
      game$7.createPlayer().then((tx) => {
        console.log("Wait for Event or mined transaction!");
        this.props.observable.trigger('new-player');
      });
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<form class="pure-form pure-form-aligned"><h2>It seems you haven\'t joined the game yet</h2><p>\n      Create a account to proceed and start fighting the <i>worst</i> pay to win crypto game on the\n      blockchain!\n    </p><fieldset><div class="pure-control-group"><label>Game Contract:</label><span expr15="expr15" class="pure-form-message-inline"> </span></div><b expr16="expr16" style="text-align:center;display:inline-block;width:100%"></b><div class="pure-controls"><button expr17="expr17" type="submit" class="pure-button pure-button-primary">Create Account\n        </button></div></fieldset></form>',
      [{
        'redundantAttribute': 'expr15',
        'selector': '[expr15]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.state.address;
          }
        }]
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return !scope.state.canCreateAccount;
        },

        'redundantAttribute': 'expr16',
        'selector': '[expr16]',

        'template': template(
          '\n        It seems that currently no new accounts can be created!\n      ',
          []
        )
      }, {
        'redundantAttribute': 'expr17',
        'selector': '[expr17]',

        'expressions': [{
          'type': expressionTypes.ATTRIBUTE,
          'name': 'disabled',

          'evaluate': function(scope) {
            return !scope.state.canCreateAccount;
          }
        }, {
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.onClick;
          }
        }]
      }]
    );
  },

  'name': 'new-player'
};

const game$6 = new GameContractService();

var ViewCreateItem = {
  'css': `view-create-item .pure-control-group label,[is="view-create-item"] .pure-control-group label{ vertical-align: super!important; } view-create-item .pure-control-group input,[is="view-create-item"] .pure-control-group input{ width: initial!important; } view-create-item table,[is="view-create-item"] table{ color: #333; }`,

  'exports': {
    state: {},

    onBeforeMount() {
      this.state = {
        items: game$6.getAllItems(),
      };

      game$6.events.on('ItemCreated', this.onItemCreated);
    },

    onItemCreated(event) {
      this.update({
        items: game$6.getAllItems()
      });
    },

    onBeforeUnmount() {
      game$6.events.off('ItemCreated', this.onItemCreated);
    },

    createNewItem(e) {
      e.preventDefault();
      const item = {
        slot: this.$('#aligned-slot').value,
        attack: this.$('#aligned-attack').value,
        defense: this.$('#aligned-defense').value,
        health: this.$('#aligned-health').value,
        isShop: null,
        price: this.$('#aligned-price').value,
        name: this.$('#aligned-name').value
      };

      if (item.price > 0)
        item.isShop = true;

      game$6.createItem(item);
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<b>Create a new Item:</b><form class="pure-form pure-form-aligned"><fieldset><div class="pure-control-group"><label for="aligned-slot">Slot</label><select id="aligned-slot"><option value="0">Head</option><option value="1">Chest</option><option value="2">Arms</option><option value="3">Pants</option><option value="4">Shoes</option></select></div><div class="pure-control-group"><label for="aligned-attack">Name</label><input type="text" id="aligned-name" placeholder="Itemname"/></div><div class="pure-control-group"><label for="aligned-attack">Attack</label><input type="number" id="aligned-attack" placeholder="0"/></div><div class="pure-control-group"><label for="aligned-defense">Defense</label><input type="number" id="aligned-defense" placeholder="0"/></div><div class="pure-control-group"><label for="aligned-health">Health</label><input type="number" id="aligned-health" placeholder="0"/></div><div class="pure-control-group"><label for="aligned-price">Shop Price</label><input type="number" id="aligned-price" placeholder="0"/><span style="display:block;text-align:center">\n            If the price is 0 the item will not be available in the shop\n          </span></div><div class="pure-controls"><button expr91="expr91" type="submit" class="pure-button pure-button-primary">\n          Submit\n        </button></div></fieldset></form><b>All Items:<small expr92="expr92" style="padding-left:.5em"> </small></b><table class="pure-table"><thead><tr><th>#</th><th>Name</th><th>Slot</th><th>Attack</th><th>Defense</th><th>Health</th><th>Shop Item</th><th>Shop Price</th></tr></thead><tbody><tr expr93="expr93"></tr></tbody></table>',
      [{
        'redundantAttribute': 'expr91',
        'selector': '[expr91]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.createNewItem;
          }
        }]
      }, {
        'redundantAttribute': 'expr92',
        'selector': '[expr92]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return ['(', scope.state.items.length, ')'].join('');
          }
        }]
      }, {
        'type': bindingTypes.EACH,
        'getKey': null,
        'condition': null,

        'template': template(
          '<td expr94="expr94"> </td><td expr95="expr95"> </td><td expr96="expr96"> </td><td expr97="expr97"> </td><td expr98="expr98"> </td><td expr99="expr99"> </td><td expr100="expr100"> </td><td expr101="expr101"> </td>',
          [{
            'redundantAttribute': 'expr94',
            'selector': '[expr94]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.id;
              }
            }]
          }, {
            'redundantAttribute': 'expr95',
            'selector': '[expr95]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.name;
              }
            }]
          }, {
            'redundantAttribute': 'expr96',
            'selector': '[expr96]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.slot;
              }
            }]
          }, {
            'redundantAttribute': 'expr97',
            'selector': '[expr97]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.attack.toString();
              }
            }]
          }, {
            'redundantAttribute': 'expr98',
            'selector': '[expr98]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.defense.toString();
              }
            }]
          }, {
            'redundantAttribute': 'expr99',
            'selector': '[expr99]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.health.toString();
              }
            }]
          }, {
            'redundantAttribute': 'expr100',
            'selector': '[expr100]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.isShop;
              }
            }]
          }, {
            'redundantAttribute': 'expr101',
            'selector': '[expr101]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.price.toString();
              }
            }]
          }]
        ),

        'redundantAttribute': 'expr93',
        'selector': '[expr93]',
        'itemName': 'item',
        'indexName': null,

        'evaluate': function(scope) {
          return scope.state.items;
        }
      }]
    );
  },

  'name': 'view-create-item'
};

const game$5 = new GameContractService();

var ViewOwner = {
  'css': `view-owner .pure-control-group label,[is="view-owner"] .pure-control-group label{ vertical-align: super!important; } view-owner .pure-control-group input,[is="view-owner"] .pure-control-group input{ width: initial!important; } view-owner table,[is="view-owner"] table{ color: #333; }`,

  'exports': {
    state: {},

    components: {
      ViewCreateItem
    },

    onBeforeMount() {
      this.state = {
        allowNewPlayers: game$5.canCreateNewPlayers(),
        view: {overview: true},
        balance: web3.eth.getBalance(game$5.gameAddress()),
        isMode: game$5.isModerator(),
        token: {
          name: game$5.tokenName(),
          amount: game$5.tokenSupply(),
          canMint: game$5.canMintToken(game$5.self()),
          game: game$5.tokenBalanceOfGame(),
          price: game$5.tokenPrice(),
          address: game$5.tokenContractAddress()
        },
        template: {
          head: game$5.getNewPlayerArmorHead(),
          arms: game$5.getNewPlayerArmorArms(),
          chest: game$5.getNewPlayerArmorChest(),
          pants: game$5.getNewPlayerArmorPants(),
          shoes: game$5.getNewPlayerArmorShoes()
        }
      };
    },

    showView(view) {
      return (event) => {
        event.preventDefault();
        this.update({
          view: {
            [view]: true
          }
        });
      }
    },

    setPlayerStartingGear(event) {
      event.preventDefault();
      const head = this.$('#aligned-head').value;
      const chest = this.$('#aligned-chest').value;
      const arms = this.$('#aligned-arms').value;
      const pants = this.$('#aligned-pants').value;
      const shoes = this.$('#aligned-shoes').value;

      game$5.setPlayerTemplate(head, chest, arms, pants, shoes).then((tx) => {
        this.update({
          template: {
            head: game$5.getNewPlayerArmorHead(),
            arms: game$5.getNewPlayerArmorArms(),
            chest: game$5.getNewPlayerArmorChest(),
            pants: game$5.getNewPlayerArmorPants(),
            shoes: game$5.getNewPlayerArmorShoes()
          }
        });
      });
    },

    mint(event) {
      event.preventDefault();
      game$5.mintTokens(this.$('#mint-tokens').value);
    },

    setPrice(event) {
      event.preventDefault();
      game$5.setTokenPrice(this.$('#owner-token-price').value);
    },

    checkAllowNewPlayers(event) {
      event.preventDefault();

      game$5.setCreatePlayers(event.target.checked).then((tx) => {
        this.update({
          allowNewPlayers: game$5.canCreateNewPlayers()
        });
      });
    },

    addOwner(event) {
      event.preventDefault();
      game$5.addOwner(this.$("#new-owner-address").value);
    },

    renounceOwner(event) {
      event.preventDefault();
      game$5.renounceOwner().then((tx) => {
        this.props.observable.trigger('permissions-changed');
        this.update({
          isMod: game$5.isModerator()
        });
      });
    },

    addModerator(event) {
      event.preventDefault();
      game$5.addModerator(this.$("#new-mod-address").value).then((tx) => {
        this.props.observable.trigger('permissions-changed');
        this.update({
          isMod: game$5.isModerator()
        });
      });
    },

    fireModerator(event) {
      event.preventDefault();
      game$5.fireModerator(this.$("#old-mod-address").value).then((tx) => {
        this.update({
          isMod: game$5.isModerator()
        });
      });
    },

    renounceModerator(event) {
      event.preventDefault();
      game$5.renounceModerator().then((tx) => {
        this.props.observable.trigger('permissions-changed');
      });
    },

    payout(event) {
      event.preventDefault();
      game$5.payout(game$5.self(), web3.eth.getBalance(game$5.gameAddress())).then((tx) => {
        this.update({
          balance: web3.eth.getBalance(game$5.gameAddress())
        });
      });
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<h3 style="margin-bottom:0">Owner Dashboard</h3><div><div class="pure-menu pure-menu-horizontal" style="background-color:#EFEFEF;border-bottom:1px #AAA solid;"><ul class="pure-menu-list"><li class="pure-menu-item pure-menu-selected"><a expr18="expr18" href="#" class="pure-menu-link">Overview</a></li><li class="pure-menu-item pure-menu-selected"><a expr19="expr19" href="#" class="pure-menu-link">Token</a></li><li class="pure-menu-item pure-menu-selected"><a expr20="expr20" href="#" class="pure-menu-link">Items</a></li><li class="pure-menu-item pure-menu-selected pure-menu-has-children pure-menu-allow-hover"><a href="#" id="menuLink1" class="pure-menu-link pure-menu-selected">Role Management</a><ul class="pure-menu-children" style="width:100%;background-color:#EFEFEF;border:1px #AAA solid"><li class="pure-menu-item pure-menu-selected"><a expr21="expr21" href="#" class="pure-menu-link">Owner</a></li><li class="pure-menu-item pure-menu-selected"><a expr22="expr22" href="#" class="pure-menu-link">Moderator</a></li></ul></li></ul></div><div expr23="expr23"></div><div expr33="expr33"></div><view-create-item expr41="expr41"></view-create-item><div expr42="expr42"></div><div expr45="expr45"></div></div>',
      [{
        'redundantAttribute': 'expr18',
        'selector': '[expr18]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.showView('overview');
          }
        }]
      }, {
        'redundantAttribute': 'expr19',
        'selector': '[expr19]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.showView('token');
          }
        }]
      }, {
        'redundantAttribute': 'expr20',
        'selector': '[expr20]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.showView('items');
          }
        }]
      }, {
        'redundantAttribute': 'expr21',
        'selector': '[expr21]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.showView('manageOwners');
          }
        }]
      }, {
        'redundantAttribute': 'expr22',
        'selector': '[expr22]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.showView('manageMods');
          }
        }]
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.overview;
        },

        'redundantAttribute': 'expr23',
        'selector': '[expr23]',

        'template': template(
          '<p>This is the Owner Dashboard, all administrative stuff can be done here:</p><div><input expr24="expr24" type="checkbox" id="allow-new-players"/><label style="margin-left:0.50em" for="allow-new-players">Allow new players to register</label></div><br/><div><b>Current balance: </b><span expr25="expr25"> </span><br/><button expr26="expr26" type="submit" class="pure-button pure-button-primary">Payout</button></div><br/><b>New player starting Equipment:</b><form class="pure-form pure-form-aligned"><fieldset><div class="pure-control-group"><label for="aligned-head">Head</label><input expr27="expr27" type="number" id="aligned-head" placeholder="0"/></div><div class="pure-control-group"><label for="aligned-chest">Chest</label><input expr28="expr28" type="number" id="aligned-chest" placeholder="0"/></div><div class="pure-control-group"><label for="aligned-arms">Arms</label><input expr29="expr29" type="number" id="aligned-arms" placeholder="0"/></div><div class="pure-control-group"><label for="aligned-pants">Pants</label><input expr30="expr30" type="number" id="aligned-pants" placeholder="0"/></div><div class="pure-control-group"><label for="aligned-shoes">Shoes</label><input expr31="expr31" type="number" id="aligned-shoes" placeholder="0"/></div><div class="pure-controls"><button expr32="expr32" type="submit" class="pure-button pure-button-primary">\n              Submit\n            </button></div></fieldset></form>',
          [{
            'redundantAttribute': 'expr24',
            'selector': '[expr24]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.checkAllowNewPlayers;
              }
            }, {
              'type': expressionTypes.ATTRIBUTE,
              'name': 'checked',

              'evaluate': function(scope) {
                return scope.state.allowNewPlayers;
              }
            }]
          }, {
            'redundantAttribute': 'expr25',
            'selector': '[expr25]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return [scope.state.balance, ' Wei'].join('');
              }
            }]
          }, {
            'redundantAttribute': 'expr26',
            'selector': '[expr26]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.payout;
              }
            }]
          }, {
            'redundantAttribute': 'expr27',
            'selector': '[expr27]',

            'expressions': [{
              'type': expressionTypes.VALUE,

              'evaluate': function(scope) {
                return scope.state.template.head;
              }
            }]
          }, {
            'redundantAttribute': 'expr28',
            'selector': '[expr28]',

            'expressions': [{
              'type': expressionTypes.VALUE,

              'evaluate': function(scope) {
                return scope.state.template.chest;
              }
            }]
          }, {
            'redundantAttribute': 'expr29',
            'selector': '[expr29]',

            'expressions': [{
              'type': expressionTypes.VALUE,

              'evaluate': function(scope) {
                return scope.state.template.arms;
              }
            }]
          }, {
            'redundantAttribute': 'expr30',
            'selector': '[expr30]',

            'expressions': [{
              'type': expressionTypes.VALUE,

              'evaluate': function(scope) {
                return scope.state.template.pants;
              }
            }]
          }, {
            'redundantAttribute': 'expr31',
            'selector': '[expr31]',

            'expressions': [{
              'type': expressionTypes.VALUE,

              'evaluate': function(scope) {
                return scope.state.template.shoes;
              }
            }]
          }, {
            'redundantAttribute': 'expr32',
            'selector': '[expr32]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.setPlayerStartingGear;
              }
            }]
          }]
        )
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.token;
        },

        'redundantAttribute': 'expr33',
        'selector': '[expr33]',

        'template': template(
          '<b expr34="expr34"> </b><br/> <br/><form class="pure-form"><fieldset><div class="pure-g"><div class="pure-u-2-3">Total supply</div><div expr35="expr35" class="pure-u-1-3"> </div><div class="pure-u-2-3">Game balance</div><div expr36="expr36" class="pure-u-1-3"> </div><div class="pure-u-2-3" style="padding-right:1em"><input expr37="expr37" type="number" id="mint-tokens" placeholder="0"/></div><div class="pure-u-1-3"><button expr38="expr38" type="submit" class="pure-button pure-button-primary">Mint</button></div></div></fieldset><br/></form><b>Token price: </b><form class="pure-form"><fieldset><div class="pure-g"><div class="pure-u-1-2" style="padding-right:1em"><input expr39="expr39" style="max-width:75%" type="number" id="owner-token-price" placeholder="0"/> Wei</div><div class="pure-u-1-2"><button expr40="expr40" type="submit" class="pure-button pure-button-primary">Change token<br/>price</button></div></div></fieldset></form>',
          [{
            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 2,

              'evaluate': function(scope) {
                return ['Address: ', scope.state.token.address].join('');
              }
            }]
          }, {
            'redundantAttribute': 'expr34',
            'selector': '[expr34]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return ['Token details: (', scope.state.token.name, ')'].join('');
              }
            }]
          }, {
            'redundantAttribute': 'expr35',
            'selector': '[expr35]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.state.token.amount;
              }
            }]
          }, {
            'redundantAttribute': 'expr36',
            'selector': '[expr36]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.state.token.game;
              }
            }]
          }, {
            'redundantAttribute': 'expr37',
            'selector': '[expr37]',

            'expressions': [{
              'type': expressionTypes.ATTRIBUTE,
              'name': 'disabled',

              'evaluate': function(scope) {
                return !scope.state.token.canMint;
              }
            }]
          }, {
            'redundantAttribute': 'expr38',
            'selector': '[expr38]',

            'expressions': [{
              'type': expressionTypes.ATTRIBUTE,
              'name': 'disabled',

              'evaluate': function(scope) {
                return !scope.state.token.canMint;
              }
            }, {
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.mint;
              }
            }]
          }, {
            'redundantAttribute': 'expr39',
            'selector': '[expr39]',

            'expressions': [{
              'type': expressionTypes.VALUE,

              'evaluate': function(scope) {
                return scope.state.token.price;
              }
            }]
          }, {
            'redundantAttribute': 'expr40',
            'selector': '[expr40]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.setPrice;
              }
            }]
          }]
        )
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.items;
        },

        'redundantAttribute': 'expr41',
        'selector': '[expr41]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'view-create-item';
          },

          'slots': [],
          'attributes': []
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.manageOwners;
        },

        'redundantAttribute': 'expr42',
        'selector': '[expr42]',

        'template': template(
          '<b>Add Owner:</b><form class="pure-form"><fieldset><div class="pure-g"><div class="pure-u-2-3" style="padding-right:1em"><input style="width:100%" id="new-owner-address" placeholder="0x0000000000000000000000000000000000000000"/></div><div class="pure-u-1-3"><button expr43="expr43" type="submit" class="pure-button pure-button-primary">Add Owner</button></div></div></fieldset></form><button expr44="expr44" type="submit" class="pure-button pure-button-primary">Renounce Owner</button>',
          [{
            'redundantAttribute': 'expr43',
            'selector': '[expr43]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.addOwner;
              }
            }]
          }, {
            'redundantAttribute': 'expr44',
            'selector': '[expr44]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.renounceOwner;
              }
            }]
          }]
        )
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.manageMods;
        },

        'redundantAttribute': 'expr45',
        'selector': '[expr45]',

        'template': template(
          '<b>Add Moderator:</b><form class="pure-form"><fieldset><div class="pure-g"><div class="pure-u-2-3" style="padding-right:1em"><input style="width:100%" id="new-mod-address" placeholder="0x0000000000000000000000000000000000000000"/></div><div class="pure-u-1-3"><button expr46="expr46" type="submit" class="pure-button pure-button-primary">Add Moderator</button></div></div></fieldset></form><br/><b>Fire Moderator:</b><form class="pure-form"><fieldset><div class="pure-g"><div class="pure-u-2-3" style="padding-right:1em"><input style="width:100%" id="old-mod-address" placeholder="0x0000000000000000000000000000000000000000"/></div><div class="pure-u-1-3"><button expr47="expr47" type="submit" class="pure-button pure-button-primary">Fire Moderator</button></div></div></fieldset></form><div expr48="expr48"></div>',
          [{
            'redundantAttribute': 'expr46',
            'selector': '[expr46]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.addModerator;
              }
            }]
          }, {
            'redundantAttribute': 'expr47',
            'selector': '[expr47]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.fireModerator;
              }
            }]
          }, {
            'type': bindingTypes.IF,

            'evaluate': function(scope) {
              return scope.state.isMod;
            },

            'redundantAttribute': 'expr48',
            'selector': '[expr48]',

            'template': template(
              '<button expr49="expr49" type="submit" class="pure-button pure-button-primary">Renounce Moderator</button>',
              [{
                'redundantAttribute': 'expr49',
                'selector': '[expr49]',

                'expressions': [{
                  'type': expressionTypes.EVENT,
                  'name': 'onclick',

                  'evaluate': function(scope) {
                    return scope.renounceModerator;
                  }
                }]
              }]
            )
          }]
        )
      }]
    );
  },

  'name': 'view-owner'
};

const game$4 = new GameContractService();

var ViewCharacter = {
  'css': `view-character { color: #333; }`,

  'exports': {
    refreshTimer: null,
    state: {},

    itemName(item) {
      return game$4.getItemName(item)
    },

    onBeforeMount() {
      this.state = {
        address: game$4.self(),
        ap: game$4.actionPoints(),
        openAP: game$4.getNotClaimedActionPoints(),

        health: game$4.getHealthOfSelf(),
        attack: game$4.getAttackOfSelf(),
        defense: game$4.getDefenseOfSelf(),

        armorHead: game$4.getArmorHeadSelf(),
        armorChest: game$4.getArmorChestSelf(),
        armorArms: game$4.getArmorArmsSelf(),
        armorPants: game$4.getArmorPantsSelf(),
        armorShoes: game$4.getArmorShoesSelf(),

        wins: game$4.getWinsSelf(),
        losses: game$4.getLossesSelf()
      };
    },

    onMounted() {
      this.props.observable.on('InventoryChanged', this.onInventoryChanged);
      this.props.observable.on('APConsumed', this.onAPConsumed);
      game$4.events.on('FightWon', this.onFight);
      game$4.events.on('FightLost', this.onFight);

      this.refreshTimer = window.setInterval(() => {
        this.update({
          openAP: game$4.getNotClaimedActionPoints()
        });
      }, 1000);
    },

    onInventoryChanged() {
      this.update({
        health: game$4.getHealthOfSelf(),
        attack: game$4.getAttackOfSelf(),
        defense: game$4.getDefenseOfSelf(),

        armorHead: game$4.getArmorHeadSelf(),
        armorChest: game$4.getArmorChestSelf(),
        armorArms: game$4.getArmorArmsSelf(),
        armorPants: game$4.getArmorPantsSelf(),
        armorShoes: game$4.getArmorShoesSelf()
      });
    },

    onFight(event) {
      console.log(event);
      console.log(game$4.self());
      if (event.attacker === game$4.self()) {
        this.update({
          wins: game$4.getWinsSelf(),
          losses: game$4.getLossesSelf()
        });
      }
    },

    onAPConsumed() {
      this.update({
        ap: game$4.actionPoints()
      });
    },

    onBeforeUnmount() {
      this.props.observable.off('InventoryChanged', this.onInventoryChanged);
      this.props.observable.off('APConsumed', this.onAPConsumed);
      game$4.events.off('FightWon', this.onFight);
      game$4.events.off('FightLost', this.onFight);

      window.clearInterval(this.refreshTimer);
    },

    onRefreshAP(event) {
      game$4.refreshAP().then((tx) => {
        this.update({
          ap: game$4.actionPoints(),
          openAP: game$4.getNotClaimedActionPoints(),
        });
      });
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<h3>Your Character:<small expr50="expr50" style="font-size:60%;color:#AAA;padding-left:1em;vertical-align:middle"> </small></h3><div class="pure-g"><div class="pure-u-1-2"><b>Action Points (AP):</b></div><div class="pure-u-1-2"><b expr51="expr51"> <small expr52="expr52" style="padding-left:.5em;color:darkgreen;vertical-align:bottom"> </small></b></div><div class="pure-u-1-2"><div class="pure-u-5-5"><b>Stats:</b></div><div class="pure-u-2-5">Health:</div><div expr53="expr53" class="pure-u-2-5"> </div><div class="pure-u-2-5">Attack:</div><div expr54="expr54" class="pure-u-2-5"> </div><div class="pure-u-2-5">Defense:</div><div expr55="expr55" class="pure-u-2-5"> </div><div class="pure-u-2-5">Wins:</div><div expr56="expr56" class="pure-u-2-5"> </div><div class="pure-u-2-5">Losses:</div><div expr57="expr57" class="pure-u-2-5"> </div></div><div class="pure-u-1-2"><div class="pure-u-5-5"><b>Equipment:</b></div><div class="pure-u-2-5">Head:</div><div expr58="expr58" class="pure-u-2-5"> </div><div class="pure-u-2-5">Chest:</div><div expr59="expr59" class="pure-u-2-5"> </div><div class="pure-u-2-5">Arms:</div><div expr60="expr60" class="pure-u-2-5"> </div><div class="pure-u-2-5">Pants:</div><div expr61="expr61" class="pure-u-2-5"> </div><div class="pure-u-2-5">Shoes:</div><div expr62="expr62" class="pure-u-2-5"> </div></div></div><div class="pure-g" style="padding-top:2em;padding-bottom:2em"><div class="pure-g pure-u-1 pure-u-md-1-1"><div class="pure-u-1 pure-u-md-1-1" style="display:flex;justify-content:center;align-content:center"><button expr63="expr63" class="pure-button">Refresh AP</button></div></div></div>',
      [{
        'redundantAttribute': 'expr50',
        'selector': '[expr50]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return ['(', scope.state.address, ')'].join('');
          }
        }]
      }, {
        'redundantAttribute': 'expr51',
        'selector': '[expr51]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.state.ap;
          }
        }]
      }, {
        'redundantAttribute': 'expr52',
        'selector': '[expr52]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return ['+', scope.state.openAP].join('');
          }
        }]
      }, {
        'redundantAttribute': 'expr53',
        'selector': '[expr53]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.state.health;
          }
        }]
      }, {
        'redundantAttribute': 'expr54',
        'selector': '[expr54]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.state.attack;
          }
        }]
      }, {
        'redundantAttribute': 'expr55',
        'selector': '[expr55]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.state.defense;
          }
        }]
      }, {
        'redundantAttribute': 'expr56',
        'selector': '[expr56]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.state.wins;
          }
        }]
      }, {
        'redundantAttribute': 'expr57',
        'selector': '[expr57]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.state.losses;
          }
        }]
      }, {
        'redundantAttribute': 'expr58',
        'selector': '[expr58]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.itemName(scope.state.armorHead);
          }
        }]
      }, {
        'redundantAttribute': 'expr59',
        'selector': '[expr59]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.itemName(scope.state.armorChest);
          }
        }]
      }, {
        'redundantAttribute': 'expr60',
        'selector': '[expr60]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.itemName(scope.state.armorArms);
          }
        }]
      }, {
        'redundantAttribute': 'expr61',
        'selector': '[expr61]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.itemName(scope.state.armorPants);
          }
        }]
      }, {
        'redundantAttribute': 'expr62',
        'selector': '[expr62]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return scope.itemName(scope.state.armorShoes);
          }
        }]
      }, {
        'redundantAttribute': 'expr63',
        'selector': '[expr63]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.onRefreshAP;
          }
        }]
      }]
    );
  },

  'name': 'view-character'
};

const game$3 = new GameContractService();

var ViewInventory = {
  'css': `view-inventory .inventory-slot,[is="view-inventory"] .inventory-slot{ padding: .5em 1em; border: 1px white solid; color: #333; background-color: #EFEFEF; }`,

  'exports': {
    state: {},

    itemName(item) {
      const itemID = item.toNumber();
      if (itemID === 0) return "Empty"

      return game$3.getItemName(item)
    },

    onBeforeMount() {
      const items  = game$3.getInventory();
      const filled = items.filter(item => item.toNumber() > 0).length;

      this.state = {
        filled: filled,
        items: items
      };
    },

    onItemBoughtEvent(item) {
      const slot = item.slot.toNumber();

      if (!this.state.items[slot].eq(item.item)) {
        this.state.items[slot] = item.item;

        this.update({
          items: this.state.items,
          filled: this.state.filled + 1
        });
      }

    },

    onMounted() {
      game$3.events.on('ItemBought', this.onItemBoughtEvent);
    },

    onBeforeUnmount() {
      game$3.events.off('ItemBought', this.onItemBoughtEvent);
    },

    equip(index) {
      return (event) => {
        event.preventDefault();
        game$3.equipItem(index).then((tx) => {
          this.props.observable.trigger('InventoryChanged');
          const items  = game$3.getInventory();
          const filled = items.filter(item => item.toNumber() > 0).length;

          this.update({
            items: items,
            filled: filled
          });
        });
      }
    },

    deleteItem(index) {
      return (event) => {
        event.preventDefault();
        game$3.trashItem(index).then((tx) => {
          this.props.observable.trigger('InventoryChanged');
          const items  = game$3.getInventory();
          const filled = items.filter(item => item.toNumber() > 0).length;

          this.update({
            items: items,
            filled: filled
          });
        });
      }
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<h3>Inventory:<small expr64="expr64" style="padding-left:1em"> </small></h3><div class="pure-g"><div expr65="expr65" class="pure-u-1-6 inventory-slot"></div></div><small><i>Note:</i> Right-click on a item slot deletes the item!</small><br/>',
      [{
        'redundantAttribute': 'expr64',
        'selector': '[expr64]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return ['(', scope.state.filled, '/', scope.state.items.length, ')'].join('');
          }
        }]
      }, {
        'type': bindingTypes.EACH,
        'getKey': null,
        'condition': null,

        'template': template(' ', [{
          'expressions': [{
            'type': expressionTypes.TEXT,
            'childNodeIndex': 0,

            'evaluate': function(scope) {
              return scope.itemName(scope.item);
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'onclick',

            'evaluate': function(scope) {
              return scope.equip(scope.index);
            }
          }, {
            'type': expressionTypes.EVENT,
            'name': 'oncontextmenu',

            'evaluate': function(scope) {
              return scope.deleteItem(scope.index);
            }
          }]
        }]),

        'redundantAttribute': 'expr65',
        'selector': '[expr65]',
        'itemName': 'item',
        'indexName': 'index',

        'evaluate': function(scope) {
          return scope.state.items;
        }
      }]
    );
  },

  'name': 'view-inventory'
};

const game$2 = new GameContractService();

var ViewShop = {
  'css': null,

  'exports': {
    state: {
      token: {
        name: "",
        amount: 0,
        wei: 0
      },

      items: []
    },

    onBeforeMount() {
      this.state = {
        token: {
          name: game$2.tokenName(),
          amount: game$2.tokenBalanceOfSelf(),
          wei: game$2.tokenPrice()
        },

        items: game$2.getAllItems().filter(item => item.isShop)
      };

      game$2.events.on('TokenPriceChanged', this.onTokenPriceChanged);
      game$2.events.on('Transfer', this.onTokenTransfer);
      game$2.events.on('ItemCreated', this.onItemCreated);
    },

    onTokenPriceChanged(event) {
      console.log('onTokenPriceChanged: ', event);
      this.update({
        token: {...this.state.token, wei: event.price}
      });
    },

    onTokenTransfer(event) {
      console.log('onTokenTransfer: ', event);

      if ((event.from === game$2.gameAddress() && event.to === game$2.self())
          || (event.to === game$2.gameAddress() && event.from === game$2.self()))
        this.update({token: {...this.state.token, amount: game$2.tokenBalanceOfSelf()}});
    },

    onItemCreated(event) {
      this.update({
        items: game$2.getAllItems().filter(item => item.isShop)
      });
    },

    onBeforeUnmount() {
      game$2.events.off('TokenPriceChanged', this.onTokenPriceChanged);
      game$2.events.off('Transfer', this.onTokenTransfer);
      game$2.events.off('ItemCreated', this.onItemCreated);
    },

    buy(item) {
      return (event) => {
        event.preventDefault();
        if (this.state.token.amount.toNumber() < item.price) {
          console.log(this.state.token.amount);
          alert("Not enough tokens!");
          return
        }

        game$2.buyItem(item);
      }
    },

    buyTokens(event) {
      event.preventDefault();
      game$2.buyTokens(this.$('#shop-tokens').value);
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<h3>Shop:<small expr66="expr66" style="padding-left:1em"> </small></h3><form class="pure-form"><fieldset><div class="pure-g"><div expr67="expr67" class="pure-u-1-1"> </div><div class="pure-u-2-3" style="padding-right:1em"><input id="shop-tokens" type="number" placeholder="0"/></div><div class="pure-u-1-3"><button expr68="expr68" type="submit" class="pure-button pure-button-primary">Buy Tokens</button></div></div></fieldset></form><b>All Items:<small expr69="expr69" style="padding-left:.5em"> </small></b><table class="pure-table"><thead><tr><th>#</th><th>Slot</th><th>Attack</th><th>Defense</th><th>Health</th><th>Price</th><th></th></tr></thead><tbody><tr expr70="expr70"></tr></tbody></table>',
      [{
        'redundantAttribute': 'expr66',
        'selector': '[expr66]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return ['(Balance: ', scope.state.token.amount, ' ', scope.state.token.name, ')'].join('');
          }
        }]
      }, {
        'redundantAttribute': 'expr67',
        'selector': '[expr67]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return ['1 Token = ', scope.state.token.wei, ' Wei'].join('');
          }
        }]
      }, {
        'redundantAttribute': 'expr68',
        'selector': '[expr68]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.buyTokens;
          }
        }]
      }, {
        'redundantAttribute': 'expr69',
        'selector': '[expr69]',

        'expressions': [{
          'type': expressionTypes.TEXT,
          'childNodeIndex': 0,

          'evaluate': function(scope) {
            return ['(', scope.state.items.length, ')'].join('');
          }
        }]
      }, {
        'type': bindingTypes.EACH,
        'getKey': null,
        'condition': null,

        'template': template(
          '<td expr71="expr71"> </td><td expr72="expr72"> </td><td expr73="expr73"> </td><td expr74="expr74"> </td><td expr75="expr75"> </td><td expr76="expr76"> </td><td><a expr77="expr77" href="#">Buy</a></td>',
          [{
            'redundantAttribute': 'expr71',
            'selector': '[expr71]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.id;
              }
            }]
          }, {
            'redundantAttribute': 'expr72',
            'selector': '[expr72]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.slot;
              }
            }]
          }, {
            'redundantAttribute': 'expr73',
            'selector': '[expr73]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.attack.toString();
              }
            }]
          }, {
            'redundantAttribute': 'expr74',
            'selector': '[expr74]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.defense.toString();
              }
            }]
          }, {
            'redundantAttribute': 'expr75',
            'selector': '[expr75]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.health.toString();
              }
            }]
          }, {
            'redundantAttribute': 'expr76',
            'selector': '[expr76]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.item.price.toString();
              }
            }]
          }, {
            'redundantAttribute': 'expr77',
            'selector': '[expr77]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.buy(scope.item);
              }
            }]
          }]
        ),

        'redundantAttribute': 'expr70',
        'selector': '[expr70]',
        'itemName': 'item',
        'indexName': null,

        'evaluate': function(scope) {
          return scope.state.items;
        }
      }]
    );
  },

  'name': 'view-shop'
};

const game$1 = new GameContractService();
let maxBlocks = 0;

var ViewCharacters = {
  'css': null,

  'exports': {
    owner: "",

    state: {
      players: []
    },

    onBeforeMount() {
      this.state.players = game$1.knownPlayers.filter(address => address !== game$1.self()).map(address => game$1.getPlayerStats(address));
      game$1.events.on('PlayerSpawned', this.onPlayerSpawn);
    },

    onPlayerSpawn(event) {
      this.state.players.push(game$1.getPlayerStats(event.from));
      this.update();
    },

    onBeforeUnmount() {
      game$1.events.off('PlayerSpawned', this.onPlayerSpawn);
    },

    onDelete(index) {
      return (event) => {
        this.state.players.splice(index, 1);
        this.update();
      }
    },

    onAttack(player) {
      return (event) => {
        event.preventDefault();
        game$1.attack(player.id).then((tx) => {
          this.props.observable.trigger('APConsumed');
        });
      }
    },

    onRefresh(index) {
      return (event) => {
        this.state.players[index].attack = game$1.getPlayerStats(this.state.players[index].id);
        this.update({
          players: this.state.players
        });
      }
    },

    onAddPlayer(event) {
      const address = this.$('#add-player-address').value;
      if (!web3.isAddress(address)) {
        alert("Not a valid address!");
        return
      }

      try {
        this.state.players.push(game$1.getPlayerStats(address));
        this.update();
      } catch(error) {
        console.error(error);
        showError(error);
      }
    },

    onSearchMore(event) {
      event.preventDefault();
      const excludes = this.state.players.map((value) => value.id);
      excludes.push(game$1.self());

      maxBlocks = maxBlocks + 100;
      game$1.searchForPlayers(maxBlocks, excludes).then((set) => {
        set.forEach((address) => {
          this.state.players.push(game$1.getPlayerStats(address));
        });

        this.update();
      }).catch(error => showError(error));
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<h3>Other Players:</h3><div class="pure-g pure-form" style="padding-bottom:2em"><div class="pure-u-1 pure-u-md-1-1"><b>Add another player:</b></div><div class="pure-u-1 pure-u-md-2-3" style="padding-right:1.5em"><input type="text" id="add-player-address"" style="width:100%" placeholder="0x0000000000000000000000000000000000000000"/></div><div class="pure-u-1 pure-u-md-1-3" style="padding-right:1.5em"><button expr78="expr78" class="pure-button" style="width:100%;">Add Player</button></div></div><div expr79="expr79"></div><div expr80="expr80" class="pure-g" style="border-bottom:1px #999 solid;margin-bottom:1em;padding-bottom:0.5em"></div><div class="pure-g" style="padding-bottom:2em"><div class="pure-g pure-u-1 pure-u-md-1-1"><div class="pure-u-1 pure-u-md-1-1" style="display:flex;justify-content:center;align-content:center"><button expr88="expr88" class="pure-button">Search for other players ...</button></div></div></div>',
      [{
        'redundantAttribute': 'expr78',
        'selector': '[expr78]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.onAddPlayer;
          }
        }]
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.players.length==0;
        },

        'redundantAttribute': 'expr79',
        'selector': '[expr79]',

        'template': template(
          '<p>It seems that there are no other players here, have you tried to search or add some?</p>',
          []
        )
      }, {
        'type': bindingTypes.EACH,
        'getKey': null,
        'condition': null,

        'template': template(
          '<div class="pure-u-1 pure-u-md-1-1"><b expr81="expr81"> </b></div><div expr82="expr82" class="pure-u-1 pure-u-md-1-3"> </div><div expr83="expr83" class="pure-u-1 pure-u-md-1-3"> </div><div expr84="expr84" class="pure-u-1 pure-u-md-1-3"> </div><div class="pure-u-1 pure-u-md-1-1" style="display:flex;justify-content:flex-end;padding-top:0.55em"><button expr85="expr85" class="pure-button" style="margin-right:0.5em">Attack</button><button expr86="expr86" class="pure-button" style="margin-right:0.5em">Refresh</button><button expr87="expr87" class="pure-button" style="background:rgb(223, 117, 20);margin-right:0.5em">Delete</button></div>',
          [{
            'redundantAttribute': 'expr81',
            'selector': '[expr81]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return scope.player.id;
              }
            }]
          }, {
            'redundantAttribute': 'expr82',
            'selector': '[expr82]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return ['Attack: ', scope.player.attack.toString()].join('');
              }
            }]
          }, {
            'redundantAttribute': 'expr83',
            'selector': '[expr83]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return ['Defense: ', scope.player.defense.toString()].join('');
              }
            }]
          }, {
            'redundantAttribute': 'expr84',
            'selector': '[expr84]',

            'expressions': [{
              'type': expressionTypes.TEXT,
              'childNodeIndex': 0,

              'evaluate': function(scope) {
                return ['Health: ', scope.player.health.toString()].join('');
              }
            }]
          }, {
            'redundantAttribute': 'expr85',
            'selector': '[expr85]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.onAttack(scope.player);
              }
            }]
          }, {
            'redundantAttribute': 'expr86',
            'selector': '[expr86]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.onRefresh(scope.index);
              }
            }]
          }, {
            'redundantAttribute': 'expr87',
            'selector': '[expr87]',

            'expressions': [{
              'type': expressionTypes.EVENT,
              'name': 'onclick',

              'evaluate': function(scope) {
                return scope.onDelete(scope.index);
              }
            }]
          }]
        ),

        'redundantAttribute': 'expr80',
        'selector': '[expr80]',
        'itemName': 'player',
        'indexName': 'index',

        'evaluate': function(scope) {
          return scope.state.players;
        }
      }, {
        'redundantAttribute': 'expr88',
        'selector': '[expr88]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.onSearchMore;
          }
        }]
      }]
    );
  },

  'name': 'view-character'
};

const game = new GameContractService();

var ViewModerator = {
  'css': null,

  'exports': {
    state: {},

    components: {
      ViewCreateItem
    },

    renounceModerator(event) {
      event.preventDefault();
      game.renounceModerator().then((tx) => {
        this.props.observable.trigger('permissions-changed');
      });
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<h3 style="margin-bottom:0">Moderator Dashboard</h3><br/><button expr89="expr89" type="submit" class="pure-button pure-button-primary">Renounce Moderator</button><br/><br/><view-create-item expr90="expr90"></view-create-item>',
      [{
        'redundantAttribute': 'expr89',
        'selector': '[expr89]',

        'expressions': [{
          'type': expressionTypes.EVENT,
          'name': 'onclick',

          'evaluate': function(scope) {
            return scope.renounceModerator;
          }
        }]
      }, {
        'type': bindingTypes.TAG,
        'getComponent': getComponent,

        'evaluate': function(scope) {
          return 'view-create-item';
        },

        'slots': [],
        'attributes': [],
        'redundantAttribute': 'expr90',
        'selector': '[expr90]'
      }]
    );
  },

  'name': 'view-moderator'
};

const gameContractService = new GameContractService();

var MainGame = {
  'css': null,

  'exports': {
    events: observable(),

    state: {
      view: {},
      isOwner: false,
      isModerator: false
    },

    components: {
      NewPlayer, ViewOwner, ViewCharacter, ViewInventory, ViewShop, ViewCharacters,
      ViewModerator
    },

    hasAccount() {
      return gameContractService.isPlayer()
    },

    onBeforeMount() {
      this.state.isOwner = gameContractService.isOwner();
      this.state.isModerator = gameContractService.isModerator();

      if (!this.hasAccount()) this.state.view = {newPlayer: true};
      else                    this.state.view = {game: true};

      gameContractService.events.on('player-changed', (newPlayer) => {
        this.state.isOwner = gameContractService.isOwner();
        this.state.isModerator = gameContractService.isModerator();

        if (!this.hasAccount()) this.update({view: {newPlayer:  true}});
        else {
          this.update({view: {invalid: true}});
          this.update({view: {game: true}});
        }
      });

      gameContractService.events.on('FightWon', (event) => { showError('Won a fight against: ' + event.attacker); });
      gameContractService.events.on('FightLost', (event) => { showError('Lost a fight against: ' + event.attacker); });
      this.events.on('permissions-changed', this.onPermissionsChanged);
    },

    onPermissionsChanged(event) {
      this.update({
        isOwner: gameContractService.isOwner(),
        isModerator: gameContractService.isModerator()
      });
    },

    onMounted() {
      this.events.on('new-player', () => {
        this.update({
          view: {game: true}
        });
      });
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<div class="pure-g"><div class="pure-u-1 pure-u-md-1-3" style="padding-right:1em"><view-owner expr7="expr7"></view-owner><view-moderator expr8="expr8"></view-moderator><view-shop expr9="expr9"></view-shop></div><div class="pure-u-1 pure-u-md-1-3" style="padding-left:0.5em;padding-right:0.5em"><new-player expr10="expr10"></new-player><view-character expr11="expr11"></view-character><view-characters expr12="expr12"></view-characters></div><div class="pure-u-1 pure-u-md-1-3" style="padding-left:1em"><view-inventory expr13="expr13"></view-inventory><view-shop expr14="expr14"></view-shop></div></div>',
      [{
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.isOwner;
        },

        'redundantAttribute': 'expr7',
        'selector': '[expr7]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'view-owner';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'observable',

            'evaluate': function(scope) {
              return scope.events;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.isModerator && !scope.state.isOwner;
        },

        'redundantAttribute': 'expr8',
        'selector': '[expr8]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'view-moderator';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'observable',

            'evaluate': function(scope) {
              return scope.events;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.game && !(scope.state.isOwner || scope.state.isModerator);
        },

        'redundantAttribute': 'expr9',
        'selector': '[expr9]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'view-shop';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'tokens',

            'evaluate': function(scope) {
              return scope.state.tokenContractInstance;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.newPlayer;
        },

        'redundantAttribute': 'expr10',
        'selector': '[expr10]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'new-player';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'observable',

            'evaluate': function(scope) {
              return scope.events;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.game;
        },

        'redundantAttribute': 'expr11',
        'selector': '[expr11]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'view-character';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'observable',

            'evaluate': function(scope) {
              return scope.events;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.game;
        },

        'redundantAttribute': 'expr12',
        'selector': '[expr12]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'view-characters';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'observable',

            'evaluate': function(scope) {
              return scope.events;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.game;
        },

        'redundantAttribute': 'expr13',
        'selector': '[expr13]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'view-inventory';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'observable',

            'evaluate': function(scope) {
              return scope.events;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.view.game && scope.state.isOwner;
        },

        'redundantAttribute': 'expr14',
        'selector': '[expr14]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'view-shop';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'tokens',

            'evaluate': function(scope) {
              return scope.state.tokenContractInstance;
            }
          }]
        }])
      }]
    );
  },

  'name': 'main-game'
};

var App = {
  'css': null,

  'exports': {
    state: {
      hasGameContractAddress: false,
      gameContract: "",
    },

    components: {
      AppHeader, NewContract, MainGame
    },

    events: observable(),

    hasGameContractAddress() {
      return window.localStorage.getItem("game-contract") !== null
    },

    onBeforeMount() {
      this.state.selectedAccount = web3.eth.defaultAccount;
      this.state.hasGameContractAddress = this.hasGameContractAddress();

      if (this.hasGameContractAddress()) {
        this.state.gameContract = window.localStorage.getItem("game-contract");
        try {
          loadGameContract();
        } catch(error) {
          console.error(error);
          alert(error);
        }
      }

      this.events.on('new-contract', () => {
        this.update({
          hasGameContractAddress: true,
        });
      });
    }
  },

  'template': function(template, expressionTypes, bindingTypes, getComponent) {
    return template(
      '<app-header expr0="expr0"></app-header><div class="content-wrapper"><div class="content"><div id="root"><new-contract expr1="expr1"></new-contract><main-game expr2="expr2"></main-game></div></div></div>',
      [{
        'type': bindingTypes.TAG,
        'getComponent': getComponent,

        'evaluate': function(scope) {
          return 'app-header';
        },

        'slots': [],

        'attributes': [{
          'type': expressionTypes.ATTRIBUTE,
          'name': 'gameContract',

          'evaluate': function(scope) {
            return scope.state.gameContract;
          }
        }, {
          'type': expressionTypes.ATTRIBUTE,
          'name': 'observable',

          'evaluate': function(scope) {
            return scope.events;
          }
        }],

        'redundantAttribute': 'expr0',
        'selector': '[expr0]'
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return !scope.state.hasGameContractAddress;
        },

        'redundantAttribute': 'expr1',
        'selector': '[expr1]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'new-contract';
          },

          'slots': [],

          'attributes': [{
            'type': expressionTypes.ATTRIBUTE,
            'name': 'observable',

            'evaluate': function(scope) {
              return scope.events;
            }
          }]
        }])
      }, {
        'type': bindingTypes.IF,

        'evaluate': function(scope) {
          return scope.state.hasGameContractAddress;
        },

        'redundantAttribute': 'expr2',
        'selector': '[expr2]',

        'template': template(null, [{
          'type': bindingTypes.TAG,
          'getComponent': getComponent,

          'evaluate': function(scope) {
            return 'main-game';
          },

          'slots': [],
          'attributes': []
        }])
      }]
    );
  },

  'name': 'app'
};

const remoteAddress = "http://localhost:9545";

/* Web3 must be an external plugin, otherwise building the bundle doesn't work */
/* Load Web3 for development network and set account 0 as default account ...  */
//if (typeof web3 === 'undefined') {
try {
  window['web3'] = new Web3(new Web3.providers.HttpProvider(remoteAddress));
  if (web3.eth.defaultAccount === undefined)
    web3.eth.defaultAccount = web3.eth.accounts[0];
} catch (error) {
  console.error(error);
  alert(error);
}
/*} else if (window.ethereum) {
  console.log("Injected ethereum detected, building web3 from it ...")
  window.web3 = new Web3(ethereum);
  ethereum.enable().then(() => {
    console.log("Enabled!")
  })
} else {
  console.log("Injected Web3, detected ... this may not work correctly")
  window.web3 = new Web3(web3.currentProvider);
}*/

/* Mount App component */
component(App)(document.getElementById('app-root'));
