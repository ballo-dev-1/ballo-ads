// Allow uppercase .PNG extension (e.g. stats-chart.PNG) for static imports
declare module '*.PNG' {
  const src: string
  export default src
}
