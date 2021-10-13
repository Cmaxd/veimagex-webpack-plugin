const fs = require('fs');
const path = require('path');

function handleCss(dir, options) {
  const files = fs.readdirSync(dir);
  files.forEach(function (file) {
    const filePath = `${dir}/${file}`;
    const info = fs.statSync(filePath);
    if (info.isDirectory()) {
      handleCss(filePath, options);
    } else {
      if (file.match(/\.css$/) && !file.match(new RegExp(`\\.${options.format}\\.css`))) {
        let result = fs.readFileSync(filePath, 'utf-8');
        const reg = new RegExp('\\/\\/.+\\.image', 'g');
        if (result.match(reg)) {
          const urls = Array.from(new Set(result.match(reg)));
          urls.map(url => {
            const urlReg = new RegExp(`${url}`, 'g');
            result = result.replace(urlReg, `${url.slice(0, url.length - 5)}${options.format}`);
          })
        }
        fs.writeFileSync(path.join(dir, file.replace(/\.css/, `.${options.format}.css`)), result, 'utf8');
      }
    }
  });
}

module.exports = handleCss;
