import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Avatar, Box } from '@mui/material';
import { getUsers, getUserPosts, getPostComments, getRandomImage } from '../services/api';

const TrendingPosts = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const users = await getUsers();
        const allPosts = [];
        const usersMap = new Map(Object.entries(users));

        // Fetch all posts from all users
        for (const [userId, userName] of usersMap) {
          const posts = await getUserPosts(userId);
          allPosts.push(...posts.map(post => ({
            ...post,
            userName,
            userId
          })));
        }

        // Fetch comments for all posts
        const postsWithComments = await Promise.all(
          allPosts.map(async (post) => {
            const comments = await getPostComments(post.id);
            return {
              ...post,
              commentCount: comments.length
            };
          })
        );

        // Find the maximum comment count
        const maxComments = Math.max(...postsWithComments.map(post => post.commentCount));

        // Filter posts with the maximum number of comments
        const trending = postsWithComments.filter(post => post.commentCount === maxComments);

        // Add random images and format the data
        const formattedPosts = trending.map(post => ({
          ...post,
          image: getRandomImage(400, 200)
        }));

        setTrendingPosts(formattedPosts);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, []);

  if (loading) {
    return <Typography>Loading trending posts...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trending Posts
      </Typography>
      <Grid container spacing={3}>
        {trendingPosts.map((post) => (
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

export default TrendingPosts; 