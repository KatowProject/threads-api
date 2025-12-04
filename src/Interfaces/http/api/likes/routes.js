module.exports = (handle) => [
    {
        method: 'PUT',
        path: '/threads/{threadId}/comments/{commentId}/likes',
        handler: handle.putLikeHandler,
        options: {
            auth: 'forumapi_jwt',
        },
    },
];
