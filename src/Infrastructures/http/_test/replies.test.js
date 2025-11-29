const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestUser,
      });

      // login to get access token
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: requestUser.username, password: requestUser.password },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // create thread
      const createThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'a title', body: 'a body' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(createThreadResponse.payload);

      // add comment
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'a comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment } } = JSON.parse(addCommentResponse.payload);

      // Action - add reply
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: { content: 'a reply' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual('a reply');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' },
      });

      // login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: 'dicoding', password: 'secret' },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-999/comments/comment-999/replies',
        payload: { content: 'a reply' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when reply deleted by owner', async () => {
      // Arrange
      const requestUser = {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      };
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: requestUser,
      });

      // login
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: { username: requestUser.username, password: requestUser.password },
      });
      const { data: { accessToken } } = JSON.parse(loginResponse.payload);

      // create thread
      const createThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'a title', body: 'a body' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedThread } } = JSON.parse(createThreadResponse.payload);

      // add comment
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'a comment' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedComment } } = JSON.parse(addCommentResponse.payload);

      // add reply
      const addReplyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`,
        payload: { content: 'a reply' },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { data: { addedReply } } = JSON.parse(addReplyResponse.payload);

      // Action - delete reply
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when deleting reply by non-owner', async () => {
      // Arrange
      const userA = { username: 'owner', password: 'secret', fullname: 'Owner' };
      const userB = { username: 'other', password: 'secret', fullname: 'Other' };
      const server = await createServer(container);

      // add users
      await server.inject({ method: 'POST', url: '/users', payload: userA });
      await server.inject({ method: 'POST', url: '/users', payload: userB });

      // login A and B
      const loginA = await server.inject({ method: 'POST', url: '/authentications', payload: { username: userA.username, password: userA.password } });
      const loginB = await server.inject({ method: 'POST', url: '/authentications', payload: { username: userB.username, password: userB.password } });
      const { data: { accessToken: tokenA } } = JSON.parse(loginA.payload);
      const { data: { accessToken: tokenB } } = JSON.parse(loginB.payload);

      // create thread by A
      const createThreadResponse = await server.inject({ method: 'POST', url: '/threads', payload: { title: 'a title', body: 'a body' }, headers: { Authorization: `Bearer ${tokenA}` } });
      const { data: { addedThread } } = JSON.parse(createThreadResponse.payload);

      // add comment by A
      const addCommentResponse = await server.inject({ method: 'POST', url: `/threads/${addedThread.id}/comments`, payload: { content: 'a comment' }, headers: { Authorization: `Bearer ${tokenA}` } });
      const { data: { addedComment } } = JSON.parse(addCommentResponse.payload);

      // add reply by A
      const addReplyResponse = await server.inject({ method: 'POST', url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies`, payload: { content: 'a reply' }, headers: { Authorization: `Bearer ${tokenA}` } });
      const { data: { addedReply } } = JSON.parse(addReplyResponse.payload);

      // Action: try delete by B
      const response = await server.inject({ method: 'DELETE', url: `/threads/${addedThread.id}/comments/${addedComment.id}/replies/${addedReply.id}`, headers: { Authorization: `Bearer ${tokenB}` } });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
