if (process.env.NODE_ENV === 'production') {
  window.console.log = window.console.warn = window.console.error = () => {};
}