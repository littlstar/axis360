'use strict'

/**
 * No-op to return this only
 */

const noop = () => this

/**
 * Module symbols.
 */

import {
  $ctx,
  $run,
  $ref,
} from './symbols'

/**
 * Encode a function for execution within a
 * Command instance context.
 *
 * @public
 * @param {Function} fn
 * @return {String}
 */

export const encode = (fn) => `(${String(fn)})`

/**
 * Command class.
 *
 * @public
 */

export class Command extends Function {

  /**
   * Generates code executed in an
   * isolated context.
   *
   * @static
   * @param {Function} fn
   * @return {String}
   */

  static codegen(fn) {
    return `
    var fn = ${encode(fn)};
    fn.apply(this, arguments);
    return this;`
  }

  /**
   * Command class constructor.
   * Assigns a command runner and returns
   * a command function.
   *
   * @constructor
   * @param {Function} run
   */

  constructor(run) {
    super(Command.codegen(commandRunnerWrap))
    run = 'function' == typeof run ? run : noop
    const state = {[$run]: run}
    const ctx = this[$ctx] = new CommandContext(this, state)
    const exec = (...args) => this(ctx, run, ...args)
    const self = this
    return (...args) => exec.call(self, ...args)
  }
}

/**
 * CommandContext class.
 *
 * @public
 */

export class CommandContext {

  /**
   * CommandContext class constructor.
   *
   * @param {Command} cmd
   * @param {(Object)?} state
   */

  constructor(cmd, state) {
    this[$ref] = cmd
    Object.assign(this, state || {})
  }

  /**
   * Returns a reference to the command.
   * This is used in the commandRunnerWrap
   * function.
   *
   * @getter
   * @private
   */

  get ref() { return this[$ref] }
}

/**
 * Command runner wrap that calls a
 * commands internal run ($run) function.
 *
 * @private
 * @param {CommandContext} ctx
 * @param {Function} fn
 * @param {...Mixed} args
 * @return {Mixed}
 */

function commandRunnerWrap(ctx, run, ...args) {
  if (this && 'function' == typeof run) {
    run.apply(run, [ctx, ...args])
  }
  return this
}
