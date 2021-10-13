const handleCss = require('./handleCss');

function ImagexWebpackPlugin(htmlWebpackPlugin, options) {
  this.htmlWebpackPlugin = htmlWebpackPlugin;
  this.options = {
    ...(options || {}),
    format: options.format || 'webp',
  };
}

ImagexWebpackPlugin.prototype.apply = function (compiler) {
  var self = this;
  compiler.hooks.compilation.tap('ImagexWebpackPlugin', function (compilation) {
    const hooks = self.htmlWebpackPlugin.getHooks(compilation);
    hooks.alterAssetTagGroups.tapAsync(
      'ImagexWebpackPlugin',
      self.checkSupportFormat.bind(self)
    );
  });

  compiler.hooks.done.tap('ImagexWebpackPluginHandleCss', function (stats) {
    try {
      self.handleCss(stats, self.options);
    } catch (error) {
      console.error(error);
    }
  });
};

ImagexWebpackPlugin.prototype.checkSupportFormat = function (
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
      var isSupportFormat = !![].map && document.createElement('canvas').toDataURL('image/${this.options.format}').indexOf('data:image/${this.options.format}') == 0;
      if (isSupportFormat) document.documentElement.classList.add('__${this.options.format}__');
    `
  });
  htmlPluginData.headTags.forEach((tag, index) => {
    if (tag.tagName === 'link' && tag.attributes.rel === 'stylesheet') {
      const url = tag.attributes.href;
      // 添加代码判断是否支持相应格式
      htmlPluginData.headTags[index] = {
        tagName: 'script',
        closeTag: true,
        attributes: {
          type: 'text/javascript'
        },
        innerHTML: `
          var _headElement = document.querySelector('head');
          var _linkElement = document.createElement('link');
          _linkElement.rel = "stylesheet";
          if (document.documentElement.classList.contains('__${this.options.format}__')) {
            _linkElement.href = '${url.replace(/\.css/, `.${this.options.format}.css`)}';
          } else {
            _linkElement.href = '${url}';
          }
          _headElement.appendChild(_linkElement)
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
