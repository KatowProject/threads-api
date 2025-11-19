module.exports = (handle) => [
    {
        method: 'POST',
        path: '/threads/{threadId}/comments',
        handler: handle.postCommentHandler,
        options: {
            auth: 'forumapi_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/threads/{threadId}/comments/{commentId}',
        handler: handle.deleteCommentHandler,
        options: {
            auth: 'forumapi_jwt',
        },
    },
];