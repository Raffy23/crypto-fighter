import riot from 'rollup-plugin-riot'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from '@rollup/plugin-json';
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/main.js',
  output: {
    file: 'public/bundle.js',
    format: 'cjs'
  },
  plugins: [
    riot(),
    nodeResolve(),
    json(),
    commonjs(),
//    terser()
  ]
}