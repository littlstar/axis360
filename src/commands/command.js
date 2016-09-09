'use strict'

/**
 * Module dependencies.
 */

void 0;

/**
 * No-op to return this only
 */

const noop = () => this

/**
 * Symbol for an internal run method.
 *
 * @public
 * @const
 * @symbol nun
 */

export const $run = Symbol('run')

/**
 * Symbol for an internal reference
 *
 * @public
 * @const
 * @symbol ref
 */

export const $ref = Symbol('ref')

/**
 * Symbol for an internal context
 *
 * @public
 * @const
 * @symbol ctx
 */

export const $ctx = Symbol('ctx')

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
    return this;
    `
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
