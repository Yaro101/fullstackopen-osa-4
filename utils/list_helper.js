const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favouriteBlog = (blogs) => {
  if (blogs.length === 0) return null;
  const favourite = blogs.reduce((max, blog) => (blog.likes > max.likes ? blog : max), blogs[0])
  return {
    title: favourite.title,
    author: favourite.author,
    likes: favourite.likes
  }
}

module.exports = {
  totalLikes,
  favouriteBlog,
}