'use strict'

/**
 * Module dependencies.
 */

import DisplayTree from 'display-tree'

/**
 * No-op to return this only
 */

const noop = () => this

/**
 * Node class.
 *
 * @public
 * @class Node
 * @extends DisplayTree
 * @see https://www.npmjs.com/package/display-tree
 */

export class Node extends DisplayTree {

  /**
   * Node class constructor that
   * wraps a command.
   *
   * @param {Function} cmd
   */

  constructor(cmd) {
    super({command: cmd})
  }
}

/**
 * Scene class.
 *
 * @public
 * @class Scene
 * @extends Node
 */

export class Scene extends Node {
  constructor() {
    super(noop())
  }
}
