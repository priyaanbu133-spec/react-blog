// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
} from "react-router-dom";

// --- ProtectedRoute ---
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// --- Register Page ---
function Register({ onRegister }) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return alert("Please enter a name");
    const user = { name: trimmed, createdAt: Date.now() };
    
    onRegister(user);
    navigate("/");
  };

  return (
    <div className="center">
      <div className="card">
        <h2 className="card-title">Register</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="input"
          />
          <input
            value={Email}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Email"
            className="input"
          />
          <button type="submit" className="btn primary">Register</button>
        </form>
        
      </div>
    </div>
  );
}

// --- Login Page ---
function Login({ onLogin }) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return alert("Please enter a name");
    const user = { name: trimmed, loggedInAt: Date.now() };
    onLogin(user);
    navigate("/");
  };

  return (
    <div className="center">
      <div className="card">
        <h2 className="card-title">Login (demo)</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="input"
          />
          <button type="submit" className="btn primary">Login</button>
        </form>
        <p className="muted">
          Not registered? <Link to="/register" className="link">Register here</Link>
        </p>
      </div>
    </div>
  );
}

// --- BlogListPage ---

function BlogList({ user, onLogout }) {
  const [posts, setPosts] = useState(() => {
    const raw = localStorage.getItem("posts");
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    localStorage.setItem("posts", JSON.stringify(posts));
  }, [posts]);

  const addComment = (postIndex, text) => {
    const updated = [...posts];
    const comment = {
      author: user.name,
      text,
      createdAt: Date.now(),
    };
    updated[postIndex].comments = updated[postIndex].comments || [];
    updated[postIndex].comments.push(comment);
    setPosts(updated);
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="brand">My Blog</h1>
        <div className="header-actions">
          <span className="greeting">Hello, <strong>{user?.name}</strong></span>
          <button onClick={onLogout} className="btn outline">Logout</button>
        </div>
      </header>

      <main className="main">
        <div className="toolbar">
          <Link to="/new" className="btn ghost">+ Create New Post</Link>
        </div>

        {posts.length === 0 ? (
          <p className="muted">No posts yet — create the first one!</p>
        ) : (
          <ul className="post-list">
            {posts.map((p, i) => (
              <li key={i} className="post-item">
                <h3 className="post-title">{p.title}</h3>
                <p className="post-body">{p.body}</p>
                <div className="meta">
                  By {p.author} • {new Date(p.createdAt).toLocaleString()}
                </div>

                {/* --- Comments Section --- */}
                <div className="comments">
                  <h4>Comments</h4>
                  {(!p.comments || p.comments.length === 0) && (
                    <p className="muted">No comments yet</p>
                  )}
                  <ul className="comment-list">
                    {p.comments?.map((c, j) => (
                      <li key={j} className="comment-item">
                        <span className="comment-author">{c.author}:</span>{" "}
                        <span>{c.text}</span>
                        <div className="comment-meta">
                          {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Add new comment form */}
                  <CommentForm
                    onAdd={(text) => addComment(i, text)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

// --- Comment Page ---

function CommentForm({ onAdd }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="form comment-form">
      <input
        className="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
      />
      <button type="submit" className="btn small primary">Add</button>
    </form>
  );
}

// --- NewPost Page ---
function NewPost({ user }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const navigate = useNavigate();

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return alert("Enter title and body");
    const raw = localStorage.getItem("posts");
    const posts = raw ? JSON.parse(raw) : [];
    posts.unshift({ title: title.trim(), body: body.trim(), author: user.name, createdAt: Date.now() });
    localStorage.setItem("posts", JSON.stringify(posts));
    navigate("/");
  };

  return (
    <div className="center">
      <div className="card wide">
        <h2 className="card-title">Create New Post</h2>
        <form onSubmit={handleSave} className="form">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="input" />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Body" rows={8} className="input textarea" />
          <div className="form-actions">
            <button type="submit" className="btn primary">Save Post</button>
            <Link to="/" className="btn outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main App (single-file) ---
export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const handleLogout = () => setUser(null);

  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register onRegister={setUser} />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />

        <Route path="/new" element={
          <ProtectedRoute user={user}>
            <NewPost user={user} />
          </ProtectedRoute>
        } />

        <Route path="/" element={
          <ProtectedRoute user={user}>
            <BlogList user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={user ? '/' : '/register'} replace />} />
      </Routes>
    </Router>
  );
}
