const RepliesHandler = require('./handle');
const routes = require('./routes');

module.exports = {
    name: 'replies',
    register: async (server, { container }) => {
        const repliesHandler = new RepliesHandler(container);
        server.route(routes(repliesHandler));
    },
};