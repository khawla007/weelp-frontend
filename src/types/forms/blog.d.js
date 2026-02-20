// @ts-check

/**
 * Blog Post object (Frontend Contract)
 *
 * @typedef {Object} BlogPost
 * @property {number} id - Unique identifier
 * @property {string} title - Blog title
 * @property {string} slug - URL-friendly slug
 * @property {string} excerpt - Short description
 * @property {string} [content] - Full blog content (HTML / JSON / Markdown)
 * @property {"draft" | "published"} status - Publication status
 * @property {number[]} mediaGallery - Featured / gallery images
 * @property {Category[]} categories - Blog categories
 * @property {Tag[]} tags - Blog tags
 *
 * @property {string} createdAt - ISO creation date
 * @property {string} updatedAt - ISO last update date
 */

/**
 * Creating New Blog Post
 * @typedef {Object} BlogPostForm
 * @property {string} title - Title of the post
 * @property {object} content - Full content
 * @property {string} excerpt - Excerpt
 * @property {number[]} media_gallery - Media Gallery
 * @property {number[]} categories - Categories mention
 * @property {number[]} tags - Tags
 * @property {boolean} [publish=true] -defaults to True
 */

/**
 * Blog Media object
 *
 * @typedef {Object} Media
 * @property {number} id - Media ID
 * @property {string} name - Media name
 * @property {string} alt - Alt text
 * @property {string} url - Media URL
 */

/**
 * Blog Category object
 *
 * @typedef {Object} Category
 * @property {number} id - Category ID
 * @property {string} name - Category name
 * @property {string} slug - Category slug
 */

/**
 * Blog Tag object
 *
 * @typedef {Object} Tag
 * @property {number} id - Tag ID
 * @property {string} name - Tag name
 * @property {string} slug - Tag slug
 */
