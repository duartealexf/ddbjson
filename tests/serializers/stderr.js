module.exports = class StdErrSerializer {
  /** @type {string[]} */
  contents = [];

  get output () {
    return this.contents.join('');
  }

  reset () {
    this.contents = [];
  }

  /**
   * @param  {...string} args
   */
  push (...args) {
    this.contents.push(...args);
  }

  asymmetricMatch (value) {
    return this.contents.join('') === value;
  }

  /**
   * @param {unknown} value
   */
  static test (value) {
    return value instanceof StdErrSerializer;
  }

  /**
   * @param {StdErrSerializer} value
   */
  static serialize (value) {
    return value.toString();
  }
};
