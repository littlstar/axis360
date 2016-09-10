'use strict';

/**
 * Module dependencies.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Frame = Frame;

var _commands = require('./commands');

/**
 * Creates a FrameCommand function instance.
 *
 * @param {Context} ctx
 * @return {Function}
 */

function Frame(ctx) {
  return new _commands.FrameCommand(ctx);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9mcmFtZS5qcyJdLCJuYW1lcyI6WyJGcmFtZSIsImN0eCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUE7Ozs7Ozs7UUFhZ0JBLEssR0FBQUEsSzs7QUFUaEI7O0FBRUE7Ozs7Ozs7QUFPTyxTQUFTQSxLQUFULENBQWVDLEdBQWYsRUFBb0I7QUFDekIsU0FBTywyQkFBaUJBLEdBQWpCLENBQVA7QUFDRCIsImZpbGUiOiJmcmFtZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxuaW1wb3J0IHsgRnJhbWVDb21tYW5kIH0gZnJvbSAnLi9jb21tYW5kcydcblxuLyoqXG4gKiBDcmVhdGVzIGEgRnJhbWVDb21tYW5kIGZ1bmN0aW9uIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSB7Q29udGV4dH0gY3R4XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gRnJhbWUoY3R4KSB7XG4gIHJldHVybiBuZXcgRnJhbWVDb21tYW5kKGN0eClcbn1cbiJdfQ==