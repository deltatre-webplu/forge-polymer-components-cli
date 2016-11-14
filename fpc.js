#!/usr/bin/env node
var version = '1.0.0';

var program = require('commander');
var fs = require('fs');
var path = require('path');

var serverPath = 'server-path';


program
  .version(version)
  .usage('command [arguments ...]')
  .command('init', 'initialize local forge polymer component')
  .command('import [packageNames]', 'imports packages inside local imports.html')
  .command('list', 'lists all available packages');


program.on('init', function(){
  var initHtml = fs.readFileSync(__dirname + '/_init.html', {encoding: 'utf8'});
  var importsHtml = fs.readFileSync(__dirname + '/_imports.html', {encoding: 'utf8'});

  var componentName = path.basename(process.cwd());

  initHtml = initHtml.replace(/##componentName##/gi, componentName);
  importsHtml = importsHtml.replace(/##serverPath##/gi, serverPath);

  fs.writeFile(componentName + '.html', initHtml, function(err) {
      if(err) {
          return console.log(err);
      }
  });

  fs.writeFile('imports.html', importsHtml, function(err) {
      if(err) {
          return console.log(err);
      }
  });

});

program.on('import', function(packageNames){
  if(packageNames){
    packageNames.forEach(p => console.log(p));
  }
});

program.on('list', function(){

});

program.parse(process.argv);
