const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

const autoBind = require('../../../../Commons/utils/autoBind');

module.exports = class CommentHandler {
    constructor(container) {
        this._container = container;

        autoBind(this);
    }

    async postCommentHandler(request, h) {
        const { id: userId } = request.auth.credentials;
        const { threadId } = request.params;

        request.payload.threadId = threadId;
        request.payload.userId = userId;

        const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

        const addedComment = await addCommentUseCase.execute(request.payload);

        addedComment.owner = addedComment.userId;
        delete addedComment.userId;

        return h.response({
            status: 'success',
            data: {
                addedComment,
            },
        }).code(201);
    }

    async deleteCommentHandler(request, h) {
        const { id: userId } = request.auth.credentials;
        request.params.userId = userId;

        const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
        await deleteCommentUseCase.execute(request.params);

        return h.response({
            status: 'success',
        }).code(200);
    }
};