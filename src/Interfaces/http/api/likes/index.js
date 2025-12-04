const routes = require('./routes');
const LikeHandler = require('./handler');

module.exports = {
    name: 'likes',
    register: async (server, { container }) => {
        const likeHandler = new LikeHandler(container);
        server.route(routes(likeHandler));
    },
};
