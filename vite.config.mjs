import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import autoprefixer from 'autoprefixer'
import path from 'path'
import { fileURLToPath } from 'url'
import pxToRem from './build/postcss-px-to-rem.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 后端地址(与 config/prod.env.js 保持一致)
const BACKEND = 'https://devops.8888880.vip'

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  return {
    // publicDir 默认 ./public,其中 public/static -> ../static 符号链接,
    // 使 /static/* 静态资源(图片、jquery、swiper.min.js 等)按原路径在 / 下服务。
    plugins: [
      vue({
        // 本项目模板里的静态资源全部是绝对路径 <img src="/static/...">,应交给 publicDir 运行时服务,
        // 不能被编译成 import(相对引用为 0)。故关闭模板资源 URL 转换,保持 src 原样。
        template: { transformAssetUrls: false },
      }),
    ],

    resolve: {
      // 注意:Vite(@rollup/plugin-alias)里 'vue$' 的 $ 是字面字符,不是 webpack 的结尾锚点,
      // 必须用正则 /^vue$/ 做精确匹配。否则 import 'vue' 命中不到,会退回不含编译器的运行时构建,
      // 导致 main.js 的 new Vue({ template: '<App/>' }) 报 "runtime-only build" 警告。
      alias: [
        { find: /^vue$/, replacement: 'vue/dist/vue.esm.js' }, // 带模板编译器的完整构建
        { find: '@', replacement: path.resolve(__dirname, 'src') },
      ],
      extensions: ['.mjs', '.js', '.vue', '.json'],
    },

    // 代码里用到的 process.env.*(Vite 默认走 import.meta.env,这里显式注入以兼容旧写法)
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
      'process.env.API_BASE_URL': JSON.stringify(BACKEND),
      'process.env.SPONSOR_BASE_URL': JSON.stringify(BACKEND),
    },

    css: {
      // 显式内联 postcss 配置,避免 .postcssrc.js / postcss.config.js 的解析歧义。
      // autoprefixer@10 兼容 postcss8;pxToRem 为普通函数式插件(postcss6/8 通用)。
      postcss: {
        plugins: [
          autoprefixer(),
          pxToRem({ rootValue: 37.5, unitPrecision: 5, minPixelValue: 0 }),
        ],
      },
    },

    server: {
      host: true, // 允许局域网/手机访问
      port: 8080,
      proxy: {
        // 复刻原 webpack devServer 代理:/api 转发到后端,规避开发期跨域
        '/api': { target: BACKEND, changeOrigin: true, secure: false },
      },
    },

    build: {
      outDir: 'dist',
      assetsDir: 'static', // 与原构建保持一致:产物落在 /static 下
      chunkSizeWarningLimit: 4000, // 老依赖体积大,关闭噪音告警
    },
  }
})
