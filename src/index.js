const handleCss = require('./handleCss');

function ImagexWebpackPlugin(htmlWebpackPlugin, options) {
  this.htmlWebpackPlugin = htmlWebpackPlugin;
  this.options = options || {};
}

ImagexWebpackPlugin.prototype.apply = function (compiler) {
  var self = this;
  compiler.hooks.compilation.tap('ImagexWebpackPlugin', function (compilation) {
    const hooks = self.htmlWebpackPlugin.getHooks(compilation);
    hooks.alterAssetTagGroups.tapAsync(
      'ImagexWebpackPlugin',
      self.checkSupportWebp.bind(self)
    );
  });

  compiler.hooks.done.tap('ImagexWebpackPluginHandleCss', function (stats) {
    try {
      console.log('********', self.options)
      self.handleCss(stats, self.options);
    } catch (error) {
      console.log(error);
    }
  });
};

ImagexWebpackPlugin.prototype.checkSupportWebp = function (
  htmlPluginData,
  callback
) {
  htmlPluginData.headTags.unshift({
    tagName: 'script',
    closeTag: true,
    attributes: {
      type: 'text/javascript'
    },
    innerHTML: `
      var isSupportWebp = !![].map && document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') == 0;
      if (isSupportWebp) document.documentElement.classList.add('__webp__');
    `
  });
  htmlPluginData.headTags.forEach((tag, index) => {
    if (tag.tagName === 'link' && tag.attributes.rel === 'stylesheet') {
      const url = tag.attributes.href;
      // 添加webp支持判断代码
      htmlPluginData.headTags[index] = {
        tagName: 'script',
        closeTag: true,
        attributes: {
          type: 'text/javascript'
        },
        innerHTML: `  
            var oHead = document.querySelector('head');
            var oStyle = document.createElement('link');
            oStyle.rel = "stylesheet";
            if (document.documentElement.classList.contains('__webp__')) {
              oStyle.href = '${url.replace(/\.css/, '.webp.css')}';
            } else {
              oStyle.href = '${url}';
            }
            oHead.appendChild(oStyle)
          `
      };
    }
  })
  callback(null, htmlPluginData);
};

ImagexWebpackPlugin.prototype.handleCss = function (stats, options) {
  handleCss(stats.compilation.outputOptions.path, options);
};

ImagexWebpackPlugin.loader = require.resolve('./loader');

module.exports = ImagexWebpackPlugin;
