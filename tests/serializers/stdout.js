module.exports = class StdOutSerializer {
  /** @type {unknown[]} */
  contents = [];

  get output () {
    if (this.contents.length === 0) return '';
    if (this.contents.length === 1) return JSON.stringify(this.contents[0]);
    return this.contents.join('');
  }

  reset () {
    this.contents = [];
  }

  /**
   * @param  {...unknown} args
   */
  push (...args) {
    args.forEach((arg) => {
      const parsed = JSON.parse(arg);
      this.contents.push(parsed);
    });
  }

  asymmetricMatch (value) {
    return this.contents.join('') === value;
  }

  /**
   * @param {unknown} value
   */
  static test (value) {
    return value instanceof StdOutSerializer;
  }

  /**
   * @param {StdOutSerializer} value
   */
  static serialize (value) {
    return JSON.stringify(value.contents, null, 2);
  }
};
