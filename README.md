## veImageX Webpack Plugin

一款 webpack 插件，可以将代码中引入的本地图片资源上传至云端（veImageX），快速接入 veImageX 提供的云端处理能力，并且能够根据浏览器的支持情况加载高压缩率格式的图片，以优化图片加载速度，使用前请先开通[`veImageX图片服务`](https://t.zijieimg.com/dnbVv2k/)

### 安装

```
// use npm
npm install veimagex-webpack-plugin --save-dev

// use yarn
yarn add veimagex-webpack-plugin --dev
```

### 配置
插件分为两部分：
+ loader部分将本地图片上传至 veImageX，并替换成 veImageX 生成的url
+ plugin部分用于处理 css 中引入的本地图片

loader部分的使用方法同 [`file-loader`](https://github.com/webpack-contrib/file-loader)，支持 file-loader 的所有参数，新增了用于图片上传和处理的参数，file-loader相关参数主要用于上传失败后的文件处理

```
// webpack.config.js

const ImagexWebpackPlugin = require('veimagex-webpack-plugin');

// 引入loader
module: {
  rules: [
    {
      loader: ImagexWebpackPlugin.loader,
      test: /\.(png|jpe?g)$/i,
      options: {
        outputPath: 'static/media',
        name: '[name].[hash:8].[ext]',
        serviceId: '<veImageX服务ID>',
        template: '<veImageX模板名称>',
        domain: '<veImageX上绑定的域名>',
        params: '<参数数组>', // 如果模板中有url参数则需要指定
        accessKey: '<火山引擎accessKey>',
        secretKey: '<火山引擎secretKey>',
        region: 'cn' | 'sg' | 'us', // 上传区域
      },
    }
  ]
},

// 引入plugin
plugins: [
  new ImagexWebpackPlugin(HtmlWebpackPlugin, {
    format: 'webp' | 'heif' | 'avif', // 目标图片格式
  })
]

```

### 注意

不要对同一个图片文件同时使用 file-loader 和 @byted/imagex-webpack-plugin
