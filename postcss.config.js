// 说明:实际生效的是 .postcssrc.js(postcss-load-config 优先命中它),本文件为保持一致的备用配置。
// px->rem 使用内联插件(build/postcss-px-to-rem.js),避免 postcss-pxtorem@6 与 PostCSS 6 工具链的版本冲突。
var pxToRem = require('./build/postcss-px-to-rem')

module.exports = () => ({
  plugins: [
    // autoprefixer 自动补齐 CSS3 前缀，适配不同浏览器
    require('autoprefixer')({
      overrideBrowserslist: [
        'last 10 versions', // 所有主流浏览器最近10版本用
      ],
    }),
    // 手机端 px -> rem,设计稿宽度 375 => rootValue 37.5
    pxToRem({ rootValue: 37.5, unitPrecision: 5, minPixelValue: 0 }),
  ],
})
