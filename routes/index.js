module.exports = (app) =>{
  //API routes
  app.use('/api/foo', require('./api/foo'));

  //Client routes
  app.use('/', require('./client/foo.js'));
}
