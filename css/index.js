'use strict';
var yeoman = require('yeoman-generator');
var updateNotifier = require('update-notifier');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
    this.rc = this.config.getAll();

    // Have Yeoman greet the user.
    this.log('Welcome to the neat Plugin WP Styles subgenerator!');
  },

  prompting: function () {
    var done = this.async();

    updateNotifier({
      pkg: this.pkg
    }).notify({defer: false});

    var prompts = [{
      type: 'list',
      name: 'type',
      message: 'Style setup',
      choices: ['SASS', 'Basic']
    }];

    this.prompt(prompts, function (props) {
      // Sanitize inputs
      this.type        = props.type;

      done();
    }.bind(this));
  },

  configuring: function() {
    if ( ! this.fs.exists( 'Gruntfile.js') ){
      this.log( 'No Gruntfile.js found, no Grunt tasks added.' );
      return;
    }

    if ( this.type === 'SASS' ) {
      this.gruntfile.insertConfig('sass', "{dist: {options: {style: 'expanded', lineNumbers: true}, files: {'assets/css/" + this.rc.slug + ".css': 'assets/css/sass/styles.scss'}}}");;
      this.gruntfile.registerTask('styles', 'sass');
    }

    this.gruntfile.insertConfig('cssmin', "{dist: {files: {'assets/css/" + this.rc.slug + ".min.css': 'assets/css/" + this.rc.slug + ".css'}}}");
    this.gruntfile.registerTask('styles', 'cssmin');
  },

  writing: function () {
    if ( this.type === 'SASS' ) {
      this.fs.copyTpl(
        this.templatePath('styles.css'),
        this.destinationPath('assets/css/sass/styles.scss'),
        this
      );
    } else {
      this.fs.copyTpl(
        this.templatePath('styles.css'),
        this.destinationPath('assets/css/' + this.rc.slug + '.css'),
        this
      );
    }
  },

  install: function () {
    if ( ! this.options['skip-install'] ) {
      if ( this.type === 'SASS' ) {
        this.npmInstall(['grunt-contrib-sass'], { 'saveDev': true });
      }
      this.npmInstall(['grunt-contrib-cssmin'], { 'saveDev': true });
    }
  }
});