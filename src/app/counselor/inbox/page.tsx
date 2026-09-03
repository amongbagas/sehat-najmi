"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./inbox.module.css";

interface Contact {
  user: { id: string; name: string; role: string; email: string };
  lastMessage: { content: string; timestamp: string; senderId: string } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  sender: { id: string; name: string; role: string };
}

interface AvailableContact {
  id: string;
  name: string;
  email: string;
  role: string;
  studentProfile?: { class: string; nis: string };
}

export default function CounselorInboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [availableContacts, setAvailableContacts] = useState<AvailableContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedContactRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      if (!["COUNSELOR", "ADMIN"].includes(session.user.role)) {
        router.push("/dashboard");
        return;
      }
      fetchContacts();
      fetchAvailableContacts();
    }
  }, [status, session]);

  // Keep ref in sync for polling closure
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchContacts();
      if (selectedContactRef.current) {
        fetchMessages(selectedContactRef.current, false);
      }
    }, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        setAvailableContacts(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMessages = async (userId: string, scroll = true) => {
    try {
      const res = await fetch(`/api/messages?with=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        if (scroll) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectContact = (userId: string, name: string) => {
    setSelectedContact(userId);
    setSelectedName(name);
    setShowNewChat(false);
    fetchMessages(userId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const content = newMessage.trim();
    setNewMessage("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: selectedContact, content }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        fetchContacts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredContacts = availableContacts.filter((c) =>
    (c.name || c.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading" || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Memuat inbox...</p>
      </div>
    );
  }

  return (
    <div className={styles.inboxLayout}>
      {/* Contact List */}
      <div className={styles.contactList}>
        <div className={styles.contactHeader}>
          <h3>💬 Inbox</h3>
          <button
            className={styles.newChatBtn}
            onClick={() => setShowNewChat(!showNewChat)}
            title="Chat baru"
          >
            {showNewChat ? "✕" : "＋"}
          </button>
        </div>

        {/* New Chat Panel — search all students */}
        {showNewChat && (
          <div className={styles.newChatPanel}>
            <p className={styles.newChatLabel}>Cari & mulai chat dengan Siswa:</p>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari nama siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className={styles.newChatList}>
              {filteredContacts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '8px 4px' }}>
                  Tidak ada siswa ditemukan.
                </p>
              ) : filteredContacts.map((c) => (
                <button
                  key={c.id}
                  className={styles.newChatItem}
                  onClick={() => selectContact(c.id, c.name || c.email || "")}
                >
                  <div className={styles.contactAvatar}>
                    {(c.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.contactName}>{c.name || c.email}</div>
                    <div className={styles.contactRole}>
                      {c.studentProfile ? `Kelas ${c.studentProfile.class}` : "Siswa"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Conversations */}
        {contacts.length === 0 && !showNewChat ? (
          <div className={styles.emptyContacts}>
            <span style={{ fontSize: 40 }}>💬</span>
            <p>Belum ada percakapan.</p>
            <button
              className={styles.startChatBtn}
              onClick={() => setShowNewChat(true)}
            >
              Mulai Chat Baru
            </button>
          </div>
        ) : (
          contacts.map((c) => (
            <button
              key={c.user.id}
              className={`${styles.contactItem} ${
                selectedContact === c.user.id ? styles.contactActive : ""
              }`}
              onClick={() => selectContact(c.user.id, c.user.name || "")}
            >
              <div className={styles.contactAvatar}>
                {(c.user.name || "?")[0].toUpperCase()}
              </div>
              <div className={styles.contactInfo}>
                <div className={styles.contactName}>{c.user.name}</div>
                <div className={styles.contactPreview}>
                  {c.lastMessage?.content?.substring(0, 40) || "..."}
                </div>
              </div>
              {c.unreadCount > 0 && (
                <span className={styles.unreadBadge}>{c.unreadCount}</span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {!selectedContact ? (
          <div className={styles.noChat}>
            <span className={styles.noChatIcon}>💬</span>
            <h3>Pilih percakapan</h3>
            <p>Pilih kontak dari daftar atau klik ＋ untuk memulai chat baru dengan siswa</p>
          </div>
        ) : (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatAvatar}>
                {selectedName[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h4 style={{ margin: 0 }}>{selectedName}</h4>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Siswa</span>
              </div>
            </div>

            <div className={styles.messagesList}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40, fontSize: 14 }}>
                  Mulai percakapan dengan {selectedName}
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.message} ${
                    msg.senderId === session?.user?.id
                      ? styles.messageSent
                      : styles.messageReceived
                  }`}
                >
                  <div className={styles.messageBubble}>
                    <p>{msg.content}</p>
                    <span className={styles.messageTime}>
                      {new Date(msg.timestamp).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.chatInput} onSubmit={sendMessage}>
              <input
                type="text"
                placeholder={`Kirim pesan ke ${selectedName}...`}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className={styles.messageInput}
                autoFocus
              />
              <button type="submit" className={styles.sendBtn} disabled={!newMessage.trim()}>
                Kirim ↵
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
