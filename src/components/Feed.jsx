import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Avatar, Box, CircularProgress } from '@mui/material';
import { getUsers, getUserPosts, getPostComments, getRandomImage } from '../services/api';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPosts = [];
        const usersMap = new Map(Object.entries(users));

        for (const [userId, userName] of usersMap) {
          const userPosts = await getUserPosts(userId);
          allPosts.push(...userPosts.map(post => ({
            ...post,
            userName,
            userId
          })));
        }

        // Sort posts by ID in descending order (newest first)
        const sortedPosts = allPosts.sort((a, b) => b.id - a.id);

        // Add random images and fetch comments for each post
        const postsWithDetails = await Promise.all(
          sortedPosts.map(async (post) => {
            const comments = await getPostComments(post.id);
            return {
              ...post,
              image: getRandomImage(400, 200),
              commentCount: comments.length
            };
          })
        );

        setPosts(postsWithDetails);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(users).length > 0) {
      fetchPosts();
    }
  }, [users]);

  // Set up polling for new posts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const fetchNewPosts = async () => {
        try {
          const allPosts = [];
          const usersMap = new Map(Object.entries(users));

          for (const [userId, userName] of usersMap) {
            const userPosts = await getUserPosts(userId);
            allPosts.push(...userPosts.map(post => ({
              ...post,
              userName,
              userId
            })));
          }

          const sortedPosts = allPosts.sort((a, b) => b.id - a.id);
          const postsWithDetails = await Promise.all(
            sortedPosts.map(async (post) => {
              const comments = await getPostComments(post.id);
              return {
                ...post,
                image: getRandomImage(400, 200),
                commentCount: comments.length
              };
            })
          );

          setPosts(postsWithDetails);
        } catch (error) {
          console.error('Error updating feed:', error);
        }
      };

      fetchNewPosts();
    }, 30000);

    return () => clearInterval(interval);
  }, [users]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Feed
      </Typography>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={getRandomImage(50, 50)}
                    alt={post.userName}
                    sx={{ mr: 2 }}
                  />
                  <Typography variant="subtitle1">{post.userName}</Typography>
                </Box>
                <img
                  src={post.image}
                  alt="Post content"
                  style={{ width: '100%', height: 'auto', marginBottom: '1rem' }}
                />
                <Typography variant="body1" paragraph>
                  {post.content}
                </Typography>
                <Typography color="textSecondary">
                  {post.commentCount} comments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Feed; 