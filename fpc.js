#!/usr/bin/env node
var version = '1.0.0';
var serverPath = '//localhost:8081';


var program = require('commander');
var fs = require('fs');
var path = require('path');
var request = require('request');
var columnify = require('columnify');

program
.version(version)
.usage('command [arguments ...]')
.command('init [componentName]', 'initialize local forge polymer component')
.command('import [componentName]', 'imports package inside local imports.html')
.command('list', 'lists all available packages');


program.on('init', function(componentName){
  if(componentName && componentName.length){
    let  dir = './' + componentName;
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

    let initHtml = fs.readFileSync(__dirname + '/_init.html', {encoding: 'utf8'});
    let importsHtml = fs.readFileSync(__dirname + '/_imports.html', {encoding: 'utf8'});

    let currentPath = './' + componentName+ '/';

    initHtml = initHtml.replace(/##componentName##/gi, componentName);
    importsHtml = importsHtml.replace(/##serverPath##/gi, serverPath);

    fs.writeFile( currentPath + componentName + '.html', initHtml, function(err) {
      if(err) {
        return console.error(err);
      }
    });

    fs.writeFile( currentPath +'imports.html', importsHtml, function(err) {
      if(err) {
        return console.error(err);
      }
    });

    console.info(`Component "${componentName}" created`)
  }else{
    console.error('Please provide a component name');
  }
});

program.on('import', function(componentName){
  if(componentName && componentName.length){
    validateComponent(componentName)
    .then(function(isValid){
      if(isValid){

        let importsHtml = readImportComponents();
        importsHtml += getImportComponent(componentName);
        writeImportComponents(importsHtml);

        console.info(`Imported component "${componentName}"`);
      }else{
        console.error(`Component "${componentName}" not found`);
      }
    },function(){ console.error(`Component "${componentName}" not found`) });

  }else{
    console.error('Please provide a component name');
  }
});

program.on('list', function(){
  getAllComponents().then(function(components){
    console.info(columnify(components, {columns: ['Component', 'Version'], config: {Component :{ minWidth: 40},Version: {align: 'right'}}}))
  });
});

program.parse(process.argv);

function getImportComponent(componentName){
  let  importComponentString = '<link rel="import" href="##serverPath##/##componentName##/##componentName##.html">';

  return '\n'+ importComponentString
  .replace(/##serverPath##/gi, serverPath)
  .replace(/##componentName##/gi, componentName);
}

function readImportComponents(){
  return fs.readFileSync('imports.html', {encoding: 'utf8'});
}

function writeImportComponents(importsHtml){
  fs.writeFile('imports.html', importsHtml, function(err) {
    if(err) {
      return console.error(err);
    }
  });
}

function validateComponent (componentName){
  return new Promise(function(resolve, reject){

    request({
      method: 'GET',
      url: `http:${serverPath}/validate/${componentName}`
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        let res = JSON.parse(body);
        resolve(res);
      } else if (error) {
        reject(error);
      }
    });

  });
}

function getAllComponents(){
  return new Promise(function(resolve, reject){

    request({
      method: 'GET',
      url: `http:${serverPath}/list`
    }, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        let res = JSON.parse(body);
        resolve(res);
      } else if (error) {
        reject(error);
      }
    });

  });
}
