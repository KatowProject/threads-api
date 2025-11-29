const autoBind = require('../../../../Commons/utils/autoBind');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

module.exports = class RepliesHandler {
    constructor(container) {
        this._container = container;

        autoBind(this);
    }

    async postReplyHandler(request, h) {
        const { threadId, commentId } = request.params;
        const { content } = request.payload;
        const userId = request.auth.credentials.id;

        const useCasePayload = {
            threadId,
            commentId,
            content,
            userId,
        };

        const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
        const addedReply = await addReplyUseCase.execute(useCasePayload);

        return h.response({
            status: 'success',
            data: {
                addedReply,
            },
        }).code(201);
    }

    async deleteReplyHandler(request, h) {
        const { threadId, commentId, replyId } = request.params;
        const userId = request.auth.credentials.id;

        const useCasePayload = {
            threadId,
            commentId,
            replyId,
            userId,
        };

        const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
        await deleteReplyUseCase.execute(useCasePayload);

        return h.response({
            status: 'success',
        }).code(200);
    }
};