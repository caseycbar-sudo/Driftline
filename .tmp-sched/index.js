export default {
  async fetch() { return new Response("hi"); },
  async scheduled(controller, env, ctx) { console.log("[tiny] scheduled ran", controller.cron); },
};
