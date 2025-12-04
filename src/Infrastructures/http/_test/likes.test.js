const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 when liking a comment', async () => {
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

      // Action: like the comment
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when unliking a comment', async () => {
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

      // like the comment first
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Action: unlike the comment (toggle)
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 401 when request without access token', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 404 when thread not found', async () => {
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

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-xxx/comments/comment-xxx/likes',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it('should response 404 when comment not found', async () => {
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

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/comment-xxx/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });
  });

  describe('likeCount in thread detail', () => {
    it('should include likeCount in comments when viewing thread detail', async () => {
      // Arrange
      const userA = { username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' };
      const userB = { username: 'johndoe', password: 'secret', fullname: 'John Doe' };
      const server = await createServer(container);

      // add users
      await server.inject({ method: 'POST', url: '/users', payload: userA });
      await server.inject({ method: 'POST', url: '/users', payload: userB });

      // login both users
      const loginA = await server.inject({ method: 'POST', url: '/authentications', payload: { username: userA.username, password: userA.password } });
      const loginB = await server.inject({ method: 'POST', url: '/authentications', payload: { username: userB.username, password: userB.password } });
      const { data: { accessToken: tokenA } } = JSON.parse(loginA.payload);
      const { data: { accessToken: tokenB } } = JSON.parse(loginB.payload);

      // create thread
      const createThreadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: { title: 'a title', body: 'a body' },
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      const { data: { addedThread } } = JSON.parse(createThreadResponse.payload);

      // add comment
      const addCommentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${addedThread.id}/comments`,
        payload: { content: 'a comment' },
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      const { data: { addedComment } } = JSON.parse(addCommentResponse.payload);

      // like comment by both users
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      await server.inject({
        method: 'PUT',
        url: `/threads/${addedThread.id}/comments/${addedComment.id}/likes`,
        headers: { Authorization: `Bearer ${tokenB}` },
      });

      // Action: get thread detail
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${addedThread.id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(2);
    });
  });
});
