module.exports = class CreatedThread {
    constructor(payload) {
        this._verifyPayload(payload);

        const { id, title, body, userId, date } = payload;

        this.id = id;
        this.title = title;
        this.body = body;
        this.userId = userId;
        this.owner = userId;
        this.date = date;
    }

    _verifyPayload(payload) {
        const { id, title, body, userId, date } = payload;

        if (!id || !title || !body || !userId || !date) {
            throw new Error('CREATED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' ||
            typeof title !== 'string' ||
            typeof body !== 'string' ||
            typeof userId !== 'string' ||
            !(date instanceof Date)) {
            throw new Error('CREATED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}