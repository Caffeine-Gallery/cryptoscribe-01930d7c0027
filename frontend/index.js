import { backend } from "declarations/backend";

let quill;

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Quill editor
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Load initial posts
    await loadPosts();

    // Event Listeners
    document.getElementById('newPostBtn').addEventListener('click', showNewPostForm);
    document.getElementById('submitPost').addEventListener('click', handleSubmitPost);
    document.getElementById('cancelPost').addEventListener('click', hideNewPostForm);
});

async function loadPosts() {
    showLoading();
    try {
        const posts = await backend.getPosts();
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = posts.map(post => createPostHTML(post)).join('');
    } catch (error) {
        console.error('Error loading posts:', error);
    }
    hideLoading();
}

function createPostHTML(post) {
    const date = new Date(Number(post.timestamp / 1000000n));
    return `
        <article class="post">
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="author">By ${post.author}</span>
                <span class="date">${date.toLocaleDateString()}</span>
            </div>
            <div class="post-content">
                ${post.body}
            </div>
        </article>
    `;
}

function showNewPostForm() {
    document.getElementById('newPostForm').classList.remove('hidden');
    quill.setContents([{ insert: '\n' }]);
    document.getElementById('postTitle').value = '';
    document.getElementById('authorName').value = '';
}

function hideNewPostForm() {
    document.getElementById('newPostForm').classList.add('hidden');
}

async function handleSubmitPost() {
    const title = document.getElementById('postTitle').value;
    const author = document.getElementById('authorName').value;
    const content = quill.root.innerHTML;

    if (!title || !author || !content) {
        alert('Please fill in all fields');
        return;
    }

    showLoading();
    try {
        await backend.createPost(title, content, author);
        hideNewPostForm();
        await loadPosts();
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post. Please try again.');
    }
    hideLoading();
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}
