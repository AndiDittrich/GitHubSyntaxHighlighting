var _yamljs = require('yamljs');
var _fs = require('fs');
var _fetch = require('node-fetch');

// buffer html output
var htmlOutputBuffer = '';

// fetch latest linguist language support file
_fetch('https://raw.githubusercontent.com/github/linguist/master/lib/linguist/languages.yml')
    // handle errors
    .catch(function(err){
        console.err('Error', err);
    })

    // convert to text
    .then(function(res) {
        return res.text();

    // process data
    }).then(function(languageYMLData){
        // drop sections + comments
        languageYMLData = languageYMLData.replace(/^---.*$/gm, '').replace(/^#.*$/gm, '');

        // parse yaml string
        var linguistData = _yamljs.parse(languageYMLData);

        // show num entries
        console.log('Total of ' + Object.keys(linguistData).length + ' languages found');

        // generate html output
        Object.keys(linguistData).forEach(function(name) {
            addLanguage(name, linguistData[name]);
        });

        // merge content
        console.log('Generating Page..');
        var htmlHeader = getTemplate('header');
        var htmlFooter = getTemplate('footer');
        _fs.writeFileSync('index.html', htmlHeader + htmlOutputBuffer + htmlFooter);
        console.log('READY!');
    });

// push language to buffer
function addLanguage(name, attb){
    // get language identifier
    var lang = name.replace(/[^\w]/g, '').toLowerCase();

    // set default color
    var borderColor = attb.color || '#202020';

    // get aliases
    var aliases = (attb.aliases || []);
    aliases.unshift(lang);

    // get file extensions
    var ext = (attb.extensions || []);

    // more than 10 elements ?
    var addClass = ((aliases.length + ext.length) > 10  ? 'xl' : 'md');

    htmlOutputBuffer += '<div class="lang ' + addClass + '" style="background-color: ' + borderColor + '">';
    htmlOutputBuffer += '<h4>' + name + '</h4><div class="attb">';
    htmlOutputBuffer += '<div class="alias">' +aliases.join(', ') +'</div>';
    htmlOutputBuffer += '<div class="ext">' + ext.join(' ') +'</div>';
    htmlOutputBuffer += '</div></div>\n'
}

// fetch html template file and add placeholder
function getTemplate(name){
    var html = _fs.readFileSync('html/' + name + '.html', 'utf-8').toString('utf-8');

    // some vars
    html = html.replace('${build.date}', new Date());

    return html;
}