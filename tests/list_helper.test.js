const listHelper = require('../utils/list_helper')
const { test, describe } = require('node:test')
const assert = require('node:assert')


const emptyList = []

const listWithOneBlog = [
    {
        _id: '12343346456',
        title: 'Test Blog',
        author: 'Test Author',
        url: 'https://exemple.fi',
        likes: 10,
        __v: 0,
    }
]

const listWithMultipleBlogs = [
    {
        _id: "5a422a851b54a676234d17f7",
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
        __v: 0
    },
    {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
    },
    {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0
    },
    {
        _id: "5a422b891b54a676234d17fa",
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
        __v: 0
    },
    {
        _id: "5a422ba71b54a676234d17fb",
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
        __v: 0
    },
    {
        _id: "5a422bc61b54a676234d17fc",
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
        __v: 0
    }
]

describe('Total likes', () => {
    test('returns 0 for an empty list', () => {
        assert.strictEqual(listHelper.totalLikes(emptyList), 0)
    })

    test('returns the correct sum for a list with one blog', () => {
        assert.strictEqual(listHelper.totalLikes(listWithOneBlog), 10)
    })

    test('returns the correct sum for a list with multiple blogs', () => {
        assert.strictEqual(listHelper.totalLikes(listWithMultipleBlogs), 36)
    })
})

describe('Favourite blog', () => {
    test('returns null for an empty list', () => {
        assert.strictEqual(listHelper.favouriteBlog(emptyList), null)
    })

    test('the correct blog for a list with one blog', () => {
        assert.deepStrictEqual(listHelper.favouriteBlog(listWithOneBlog), {
            title: 'Test Blog',
            author: 'Test Author',
            likes: 10
        })
    })

    test('returns the correct blog for a list with multiple blogs', () => {
        const expectedFavouriteBlog = {
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            likes: 12
        }
        assert.deepStrictEqual(listHelper.favouriteBlog(listWithMultipleBlogs), expectedFavouriteBlog)
    })
})

describe('Most blogs', () => {
    test('returns null for an empty list', () => {
        assert.strictEqual(listHelper.mostBlogs(emptyList), null)
    })

    test('the correct author for a list with one blog', () => {
        assert.deepStrictEqual(listHelper.mostBlogs(listWithOneBlog), {
            author: 'Test Author',
            blogs: 1
        })
    })

    test('returns the correct author for a list with multiple blogs', () => {
        const expectedFavouriteAuthor = {
            author: "Robert C. Martin",
            blogs: 3
        }
        assert.deepStrictEqual(listHelper.mostBlogs(listWithMultipleBlogs), expectedFavouriteAuthor)
    })
})

describe('Most likes', () => {
    test('returns null for an empty list', () => {
        assert.strictEqual(listHelper.mostLikes(emptyList), null)
    })

    test('the correct author for a list with one blog', () => {
        assert.deepStrictEqual(listHelper.mostLikes(listWithOneBlog), {
            author: 'Test Author',
            likes: 10
        })
    })

    test('returns the correct author for a list with multiple blogs', () => {
        const authorWithMostLikes = {
            author: "Edsger W. Dijkstra",
            likes: 17
        }
        assert.deepStrictEqual(listHelper.mostLikes(listWithMultipleBlogs), authorWithMostLikes)
    })
})