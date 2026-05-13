const server= Bun.serve({
    routes:{
        // add the routes here when defined them
    },
    fetch(req) {
    return new Response("Not Found", { status: 404 });
  },
})
console.log(`Server is running at ${server.url}`)