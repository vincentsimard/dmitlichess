'use strict';

class MutationUtils {
  static hasAddedNodes = (mutation, className = undefined) => {
    const hasNodes = mutation => mutation.addedNodes.length > 0;
    const containsClass = (mutation, className) => typeof className === 'undefined' || mutation.addedNodes[0].classList.contains(className);

    return hasNodes(mutation) && containsClass(mutation, className);
  };
}
