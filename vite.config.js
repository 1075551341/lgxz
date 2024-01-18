/*
 * @Date: 2023-10-18 11:25:09
 * @LastEditors: wjs
 * @LastEditTime: 2024-01-15 17:23:50
 * @Description: 包配置+服务配置
 */
import { fileURLToPath, URL } from 'node:url'
import { createHtmlPlugin } from 'vite-plugin-html'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import legacy from '@vitejs/plugin-legacy'
// import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd())
  // console.log('{ mode, command }::: ', mode, command)
  const alias = {
    // 设置路径
    // '~': fileURLToPath(new URL('./', import.meta.url)),
    // 设置别名
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
  // console.log('import.meta.url::: ', import.meta.url)
  // if (command === 'serve') {
  // 解决警告You are running the esm-bundler build of vue-i18n.
  // alias['vue-i18n'] = 'vue-i18n/dist/vue-i18n.cjs.js'
  // }
  const legacyPlugin = legacy({
    targets: ['firefox > 40', 'chrome >= 52'],
    additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    renderLegacyChunks: true,
    polyfills: [
      'es.symbol',
      'es.promise',
      'es.promise.finally',
      'es/map',
      'es/set',
      'es.array.filter',
      'es.array.for-each',
      'es.array.flat-map',
      'es.object.define-properties',
      'es.object.define-property',
      'es.object.get-own-property-descriptor',
      'es.object.get-own-property-descriptors',
      'es.object.keys',
      'es.object.to-string',
      'web.dom-collections.for-each',
      'esnext.global-this',
      'esnext.string.match-all'
    ]
  })

  const vuePlugins = [
    vue(),
    vueJsx(),
    legacyPlugin,
    createHtmlPlugin({
      minify: true,
      /**
       * 在这里写entry后，你将不需要在`index.html`内添加 script 标签，原有标签需要删除
       */
      entry: '/src/main.js',
      // template: 'public/index.html', //指定 index.html 位置
      inject: {
        data: {
          title: env.VITE_TITLE // 出现在模版中的 <%= title %>
        }
      }
    }),
    AutoImport({
      include: [
        // './src/**/*.js',
        // './src/**/*.jsx',
        // './src/**/*.vue',
        // './.eslintrc-auto-import.json'
        /\.[j]sx?$/, //  .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.json$/, // .json
        /\.md$/ // .md
      ],
      // 这里除了引入 vue 以外还可以引入pinia、vue-router、vueuse等，
      imports: ['vue', 'vue-router'],
      // dirs: ['./src/common/**'],
      dirs: ['./src/common', './src/common/request'],
      dts: false,
      // 第三方组件库的解析器
      resolvers: [ElementPlusResolver()],
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      }
    }),
    Components({
      // dirs 指定组件所在位置，默认为 src/components,免去 import 的麻烦
      dirs: ['src/components/'],
      // 配置需要将哪些后缀类型的文件进行自动按需引入
      extensions: ['vue', 'md'],
      // 解析的 UI 组件库
      resolvers: [ElementPlusResolver()],
      deep: true
    }),
    // 放在所有插件最后
    visualizer({
      filename: 'report.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
  return {
    modules: ['node_modules'],
    plugins: vuePlugins,
    resolve: {
      alias: alias,
      // 导入时想要省略的扩展名列表
      extensions: ['.mjs', '.js', '.jsx', '.json']
    },
    commonjsOptions: {
      esmExternals: true
    },
    // 引入第三方的配置,强制预构建插件包
    optimizeDeps: {
      include: ['echarts', 'axios', 'element-plus', 'vue', 'vue-router']
    },
    css: {
      devSourcemap: true //开发模式时启用
    },
    base: env.VITE_BASEURL,
    // 打包配置
    build: {
      minify: 'terser',
      sourcemap: command === 'build' ? false : 'inline',
      outDir: 'dist', //指定输出目录
      assetsInlineLimit: 4096, //4kb
      chunkSizeWarningLimit: 500, //500kb警告
      assetsDir: 'assets', //指定静态资源存储目录(相对于outDir)
      // 将js、css文件分离到单独文件夹
      rollupOptions: {
        output: {
          //如果 chunk 小于这个值则会尝试跟其他 chunk 合并，它只对纯函数有作用
          experimentalMinChunkSize: 10 * 1024, // 单位b
          // 尝试将内部变量导出为单字母变量
          minifyInternalExports: true,
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('/lodash')) {
              return 'lodash'
            }
            if (id.includes('/@vue')) {
              return 'vue-use'
            }
            if (id.includes('/node_modules/')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          }
        }
      }
    },

    // 本地运行配置，及反向代理配置
    server: {
      publicPath: '/', //部署应用包时的基本 URL。
      // host: 'localhost', // 指定服务器主机名
      host: true, // 指定服务器主机名
      port: 5000, // 指定服务器端口
      open: true, // 在服务器启动时自动在浏览器中打开应用程序
      // open: 'http://192.168.0.81:5000', // 在服务器启动时自动在浏览器中打开应用程序
      strictPort: false, // 设为 false 时，若端口已被占用则会尝试下一个可用端口,而不是直接退出
      https: false, // 是否开启 https
      cors: true, // 为开发服务器配置 CORS。默认启用并允许任何源
      force: true, // 强制使依赖预构建
      secure: true, //https
      proxy: {
        // '/foo': 'http://192.168.xxx.xxx:xxxx',
        // 选项写法
        '/api': {
          target: env.VITE_BASEURL, //代理接口
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }

    // css: {
    //   preprocessorOptions: {
    //     less: {
    //       modifyVars: {
    //         hack: `true; @import (reference) "${path.resolve('src/assets/css/base.less')}";`
    //       },
    //       javascriptEnabled: true
    //     }
    //   }
    // }
  }
})
