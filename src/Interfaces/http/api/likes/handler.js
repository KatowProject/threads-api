const ToggleLikeUseCase = require('../../../../Applications/use_case/ToggleLikeUseCase');

const autoBind = require('../../../../Commons/utils/autoBind');

module.exports = class LikeHandler {
    constructor(container) {
        this._container = container;

        autoBind(this);
    }

    async putLikeHandler(request, h) {
        const { id: userId } = request.auth.credentials;
        const { threadId, commentId } = request.params;

        const toggleLikeUseCase = this._container.getInstance(ToggleLikeUseCase.name);

        await toggleLikeUseCase.execute({ threadId, commentId, userId });

        return h.response({
            status: 'success',
        }).code(200);
    }
};
