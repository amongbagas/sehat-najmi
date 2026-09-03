"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from "./forum.module.css";

interface ForumTopic {
  id: string;
  title: string;
  timestamp: string;
  author: { id: string; name: string; role: string };
  posts: {
    id: string;
    content: string;
    timestamp: string;
    author: { id: string; name: string; role: string };
  }[];
  _count: { posts: number };
}

export default function ForumPage() {
  const { data: session } = useSession();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await fetch("/api/forum");
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const createTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewContent("");
        setShowNewTopic(false);
        fetchTopics();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedTopic) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: selectedTopic.id,
          content: replyContent,
        }),
      });

      if (res.ok) {
        setReplyContent("");
        // Re-fetch to get updated posts
        fetchTopics();
        // Update selected topic
        const updatedRes = await fetch("/api/forum");
        if (updatedRes.ok) {
          const allTopics = await updatedRes.json();
          const updated = allTopics.find(
            (t: ForumTopic) => t.id === selectedTopic.id
          );
          if (updated) setSelectedTopic(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Memuat forum...</p>
      </div>
    );
  }

  // Topic Detail View
  if (selectedTopic) {
    return (
      <div className={styles.container}>
        <button
          className={styles.backBtn}
          onClick={() => setSelectedTopic(null)}
        >
          ← Kembali ke Forum
        </button>

        <div className={styles.topicDetail}>
          <div className={styles.topicDetailHeader}>
            <h2>{selectedTopic.title}</h2>
            <div className={styles.topicMeta}>
              <span className={styles.authorTag}>
                {selectedTopic.author.role === "COUNSELOR" ? "👨‍🏫" : "🎒"}{" "}
                {selectedTopic.author.name}
              </span>
              <span>•</span>
              <span>
                {new Date(selectedTopic.timestamp).toLocaleDateString("id-ID", {
                  dateStyle: "medium",
                })}
              </span>
            </div>
          </div>

          <div className={styles.postsContainer}>
            {selectedTopic.posts.map((post, i) => (
              <div
                key={post.id}
                className={`${styles.postCard} ${
                  post.author.id === session?.user?.id ? styles.ownPost : ""
                }`}
              >
                <div className={styles.postHeader}>
                  <span className={styles.postAvatar}>
                    {(post.author.name || "?")[0].toUpperCase()}
                  </span>
                  <div>
                    <span className={styles.postAuthor}>
                      {post.author.name}
                      {post.author.role === "COUNSELOR" && (
                        <span className={styles.counselorBadge}>Guru BK</span>
                      )}
                    </span>
                    <span className={styles.postTime}>
                      {new Date(post.timestamp).toLocaleString("id-ID", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
                <p className={styles.postContent}>{post.content}</p>
              </div>
            ))}
          </div>

          <form className={styles.replyForm} onSubmit={sendReply}>
            <textarea
              className={styles.replyInput}
              placeholder="Tulis balasan..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={3}
            />
            <button
              type="submit"
              className={styles.replyBtn}
              disabled={submitting || !replyContent.trim()}
            >
              {submitting ? "Mengirim..." : "Balas"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Forum Topics List
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>🗣️ Peer Forum</h1>
          <p>Tempat berbagi cerita, saling mendukung, dan tumbuh bersama</p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => setShowNewTopic(true)}
        >
          ✏️ Buat Topik Baru
        </button>
      </div>

      {/* New Topic Form */}
      {showNewTopic && (
        <div className={styles.newTopicCard}>
          <h3>Buat Topik Baru</h3>
          <form onSubmit={createTopic}>
            <input
              className={styles.topicTitleInput}
              placeholder="Judul topik..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <textarea
              className={styles.topicContentInput}
              placeholder="Apa yang ingin kamu bagikan?"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              required
            />
            <div className={styles.newTopicActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  setShowNewTopic(false);
                  setNewTitle("");
                  setNewContent("");
                }}
              >
                Batal
              </button>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={submitting}
              >
                {submitting ? "Memposting..." : "Post"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Topics List */}
      {topics.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>💭</span>
          <h3>Belum ada topik</h3>
          <p>Jadilah yang pertama berbagi cerita!</p>
        </div>
      ) : (
        <div className={styles.topicsList}>
          {topics.map((topic) => (
            <button
              key={topic.id}
              className={styles.topicCard}
              onClick={() => setSelectedTopic(topic)}
            >
              <div className={styles.topicInfo}>
                <h4>{topic.title}</h4>
                <div className={styles.topicMeta}>
                  <span>
                    {topic.author.role === "COUNSELOR" ? "👨‍🏫" : "🎒"}{" "}
                    {topic.author.name}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(topic.timestamp).toLocaleDateString("id-ID", {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>
              </div>
              <div className={styles.topicStats}>
                <span className={styles.replyCount}>
                  {topic._count.posts} balasan
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
