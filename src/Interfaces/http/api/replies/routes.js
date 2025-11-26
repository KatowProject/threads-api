module.exports = (handler) => [
    {
        method: 'POST',
        path: '/threads/{threadId}/comments/{commentId}/replies',
        handler: handler.postReplyHandler,
        options: {
            auth: 'forumapi_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
        handler: handler.deleteReplyHandler,
        options: {
            auth: 'forumapi_jwt',
        },
    },
];