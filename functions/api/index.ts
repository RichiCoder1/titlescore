export function onRequest(context: CfCtx) {
  return new Response(`Hello, ${context.data.user?.sub}!`)
}