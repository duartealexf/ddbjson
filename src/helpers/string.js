/**
 * @returns {StringHelper}
 */
module.exports = () => {
  /** @type {StringHelper['trim']} */
  const trim = (str) => str.replace(/^['" ]+|['" ]+$/g, '');

  /** @type {StringHelper['trimJSON']} */
  const trimJSON = (str) => str.replace(/^[^{[]+|[^}\]]+$/g, '');

  return {
    trim,
    trimJSON,
  };
};
