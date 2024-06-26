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

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null
  const authorBlogCount = {}
  blogs.forEach(blog => {
    authorBlogCount[blog.author] = (authorBlogCount[blog.author] || 0) + 1
  })
  let maxBlogs = 0
  let topAuthor = null
  for (const author in authorBlogCount) {
    if (authorBlogCount[author] > maxBlogs) {
      maxBlogs = authorBlogCount[author]
      topAuthor = author
    }
  }
  return {
    author: topAuthor,
    blogs: maxBlogs
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null
  const authorLikesCount = {}
  blogs.forEach(blog => {
    authorLikesCount[blog.author] = (authorLikesCount[blog.author] || 0) + blog.likes
  })
  let maxLikes = 0
  let topAuthor = null

  for (const author in authorLikesCount) {
    if (authorLikesCount[author] > maxLikes) {
      maxLikes = authorLikesCount[author]
      topAuthor = author
    }
  }
  return {
    author: topAuthor,
    likes: maxLikes
  }
}

module.exports = {
  totalLikes,
  favouriteBlog,
  mostBlogs,
  mostLikes,
}