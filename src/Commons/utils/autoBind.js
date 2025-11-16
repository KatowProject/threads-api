/**
 * Auto-bind all prototype methods of an instance to the instance.
 * This is a small zero-dependency utility extracted from handlers that
 * need their methods bound to the instance (e.g. for route handlers).
 *
 * @param {object} instance - class instance whose prototype methods will be bound
 */
function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key === 'constructor') return;
    const val = instance[key];
    if (typeof val === 'function') {
      instance[key] = val.bind(instance);
    }
  });
}

module.exports = autoBind;
