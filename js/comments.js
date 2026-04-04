// ══════════════════════════════════════════════════════════════
//  Celestial — Comments (localStorage-backed)
// ══════════════════════════════════════════════════════════════

(function () {
    'use strict';

    const STORAGE_KEY = 'celestial_comments';
    const form = document.getElementById('comment-form');
    const list = document.getElementById('comments-list');
    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');

    if (!form || !list) return;

    function load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch (_) {
            return [];
        }
    }

    function save(comments) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function timeAgo(iso) {
        const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return minutes + 'm ago';
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + 'h ago';
        const days = Math.floor(hours / 24);
        return days + 'd ago';
    }

    function render() {
        const comments = load();
        if (comments.length === 0) {
            list.innerHTML = '<p class="comment-empty">No comments yet — be the first!</p>';
            return;
        }
        list.innerHTML = comments.map(function (c, i) {
            return '<div class="comment-card">' +
                '<div class="comment-header">' +
                    '<strong class="comment-author">' + escapeHtml(c.name) + '</strong>' +
                    '<span class="comment-time">' + timeAgo(c.date) + '</span>' +
                    '<button class="comment-delete" data-idx="' + i + '" title="Delete">✕</button>' +
                '</div>' +
                '<p class="comment-body">' + escapeHtml(c.text) + '</p>' +
            '</div>';
        }).reverse().join('');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = nameInput.value.trim();
        var text = textInput.value.trim();
        if (!name || !text) return;

        var comments = load();
        comments.push({ name: name, text: text, date: new Date().toISOString() });
        save(comments);
        textInput.value = '';
        render();
    });

    list.addEventListener('click', function (e) {
        if (!e.target.classList.contains('comment-delete')) return;
        var idx = parseInt(e.target.dataset.idx, 10);
        var comments = load();
        comments.splice(idx, 1);
        save(comments);
        render();
    });

    render();
})();
