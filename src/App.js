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


/* ---------------- ProtectedRoute ---------------- */
function ProtectedRoute({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

/* --- Register --- */
function Register({ onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) return alert("Please enter a name");
    if (!trimmedEmail) return alert("Please enter an email");

    const user = { name: trimmedName, email: trimmedEmail, createdAt: Date.now() };
    localStorage.setItem("registeredUser", JSON.stringify(user));

    onRegister(user);
    navigate("/");
  };

  return (
    <div className="auth-page register-page">
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="input"
          />
          <button type="submit" className="btn primary">Register</button>
        </form>
      </div>
    </div>
  );
}




/* ---------------- BlogList (with comments) ---------------- */
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
        <h1 className="brand"><b>My Blog</b></h1>
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
                {p.image && (
  <img
    src={p.image}
    alt="Post"
    style={{
      width: "100%",
      borderRadius: "10px",
      marginBottom: "10px",
      objectFit: "cover",
    }}
  />
)}
<p className="post-body">{p.body}</p>
                <div className="meta">
                  By {p.author} • {new Date(p.createdAt).toLocaleString()}
                </div>

                {/* Comments */}
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

                  <CommentForm onAdd={(text) => addComment(i, text)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="footer">
        <small className="muted">Demo blog — posts stored in localStorage</small>
      </footer>
    </div>
  );
}

/* ---------------- CommentForm ---------------- */
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
  const [image, setImage] = useState(null); // store base64
  const navigate = useNavigate();

  // handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return alert("Enter title and body");

    const raw = localStorage.getItem("posts");
    const posts = raw ? JSON.parse(raw) : [];

    posts.unshift({
      title: title.trim(),
      body: body.trim(),
      author: user.name,
      createdAt: Date.now(),
      image, // save image here
    });

    localStorage.setItem("posts", JSON.stringify(posts));
    navigate("/");
  };

  return (
    <div className="center">
      <div className="card wide">
        <h2 className="card-title">Create New Post</h2>
        <form onSubmit={handleSave} className="form">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="input"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Body"
            rows={8}
            className="input textarea"
          />

          {/* Image Upload Input */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="input"
          />

          {/* Preview Image */}
          {image && (
            <div className="preview">
              <img
                src={image}
                alt="preview"
                style={{
                  maxWidth: "100%",
                  marginTop: "10px",
                  borderRadius: "10px",
                }}
              />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn primary">
              Save Post
            </button>
            <Link to="/" className="btn outline">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


/* ---------------- App (main) ---------------- */
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
