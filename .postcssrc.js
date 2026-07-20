// https://github.com/michael-ciniawsky/postcss-load-config
//
// 本项目为手机端(wap),移动端适配依赖 amfe-flexible + px->rem。
// - amfe-flexible 将 <html> font-size 设为 屏宽/10(iPhone 375 => 37.5px)。
// - 设计稿宽度 375,故 rootValue = 37.5,px 折算为 rem 后随屏宽等比缩放。
//
// 注意:postcss-load-config 在 dev(vue-loader)与 prod(postcss-loader)下都优先读取本文件,
// postcss.config.js 实际不会被使用。二者已保持一致。
// px->rem 使用内联插件(见 build/postcss-px-to-rem.js),避免 postcss-pxtorem@6 与 PostCSS 6 工具链的版本冲突。
var pxToRem = require('./build/postcss-px-to-rem')

module.exports = {
  plugins: [
    require('postcss-import')(),
    require('postcss-url')(),
    // to edit target browsers: use "browserslist" field in package.json
    require('autoprefixer')(),
    pxToRem({ rootValue: 37.5, unitPrecision: 5, minPixelValue: 0 })
  ]
}
