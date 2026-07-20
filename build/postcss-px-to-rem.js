'use strict'
// 手机端 px -> rem 转换插件(普通函数式,兼容 PostCSS 6 与 8)。
//
// 背景:项目工具链(webpack3 / postcss-loader@2 / vue-loader@13)基于 PostCSS 6,
// 而依赖里的 postcss-pxtorem@6 仅兼容 PostCSS 8,直接使用会报 "Invalid PostCSS Plugin"。
// 这里内联实现同等功能,避免版本冲突,也不需要重新安装依赖。
//
// 配合 amfe-flexible:<html> font-size = 屏宽/10(iPhone 375 => 37.5px)。
// 设计稿宽度 375,故 rootValue = 37.5,使设计稿 1px => 375 屏 1px,并随屏宽等比缩放。

module.exports = function pxToRem(options) {
  var opts = options || {}
  var rootValue = opts.rootValue || 37.5
  var unitPrecision = opts.unitPrecision == null ? 5 : opts.unitPrecision
  var minPixelValue = opts.minPixelValue || 0
  // 不转换这些属性里的 px(避免改动文本内容等)
  var propBlackList = opts.propBlackList || ['content']
  // 交替匹配:要么是 url(...)(原样保留,避免误伤文件名里的 px),要么是 数字px
  var reg = /url\([^)]*\)|(-?\d*\.?\d+)px/g

  function round(num) {
    return Number(num.toFixed(unitPrecision))
  }

  function convert(value) {
    return value.replace(reg, function (match, numStr) {
      if (numStr === undefined) return match // 命中的是 url(...),原样返回
      var px = parseFloat(numStr)
      if (Math.abs(px) < minPixelValue) return match
      var rem = round(px / rootValue)
      return rem === 0 ? '0' : rem + 'rem'
    })
  }

  // 返回普通函数式插件(PostCSS 6 与 8 均接受)
  return function (root) {
    root.walkDecls(function (decl) {
      if (!decl.value || decl.value.indexOf('px') === -1) return
      if (propBlackList.indexOf(decl.prop) !== -1) return
      decl.value = convert(decl.value)
    })
  }
}
