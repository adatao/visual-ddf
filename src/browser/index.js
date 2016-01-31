require.ensure(['./embed', './styles.css'], (require) => {
  require('./styles.css');
  require('./embed');
});
