module.exports = class OutputSerializer {
  /** @type {unknown[]} */
  contents = [];

  reset() {
    this.contents = [];
  }

  /**
   * @param  {...unknown} args
   */
  push(...args) {
    args.forEach((arg) => {
      try {
        const parsed = JSON.parse(arg);
        this.contents.push(parsed);
      } catch (e) {
        this.contents.push(arg);
      }
    });
  }

  getContents() {
    return this.contents;
  }

  toString() {
    return this.contents.join("");
  }

  /**
   * @param {unknown} value
   */
  static test(value) {
    return value instanceof OutputSerializer;
  }

  /**
   * @param {OutputSerializer} value
   */
  static serialize(value) {
    return JSON.stringify(value.getContents(), null, 2);
  }
};
