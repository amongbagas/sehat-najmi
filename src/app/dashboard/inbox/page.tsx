"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "../../counselor/inbox/inbox.module.css";

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
}

export default function StudentInboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [availableContacts, setAvailableContacts] = useState<AvailableContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedContactRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchContacts();
      fetchAvailableContacts();
    }
  }, [status, session]);

  // Keep ref in sync for polling
  useEffect(() => {
    selectedContactRef.current = selectedContact;
  }, [selectedContact]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll every 5 seconds for new messages
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

  const selectContact = (userId: string, name: string, role = "Guru BK") => {
    setSelectedContact(userId);
    setSelectedName(name);
    setSelectedRole(role);
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

  if (status === "loading" || isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Memuat pesan...</p>
      </div>
    );
  }

  return (
    <div className={styles.inboxLayout}>
      <div className={styles.contactList}>
        <div className={styles.contactHeader}>
          <h3>💬 Pesan</h3>
          <button
            className={styles.newChatBtn}
            onClick={() => setShowNewChat(!showNewChat)}
            title="Chat baru"
          >
            {showNewChat ? "✕" : "＋"}
          </button>
        </div>

        {/* New Chat — list available Guru BK */}
        {showNewChat && (
          <div className={styles.newChatPanel}>
            <p className={styles.newChatLabel}>Hubungi Guru BK:</p>
            <div className={styles.newChatList}>
              {availableContacts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  Belum ada Guru BK terdaftar.
                </p>
              ) : availableContacts.map((c) => (
                <button
                  key={c.id}
                  className={styles.newChatItem}
                  onClick={() => selectContact(c.id, c.name || c.email || "", "Guru BK")}
                >
                  <div className={styles.contactAvatar}>
                    {(c.name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.contactName}>{c.name || c.email}</div>
                    <div className={styles.contactRole}>Guru BK</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {contacts.length === 0 && !showNewChat ? (
          <div className={styles.emptyContacts}>
            <span style={{ fontSize: 40 }}>💬</span>
            <p>Belum ada pesan.</p>
            <button
              className={styles.startChatBtn}
              onClick={() => setShowNewChat(true)}
            >
              Hubungi Guru BK
            </button>
          </div>
        ) : (
          contacts.map((c) => (
            <button
              key={c.user.id}
              className={`${styles.contactItem} ${
                selectedContact === c.user.id ? styles.contactActive : ""
              }`}
              onClick={() => selectContact(c.user.id, c.user.name || "", c.user.role)}
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

      <div className={styles.chatArea}>
        {!selectedContact ? (
          <div className={styles.noChat}>
            <span className={styles.noChatIcon}>💬</span>
            <h3>Kirim pesan ke Guru BK</h3>
            <p>Klik tombol ＋ atau pilih Guru BK untuk memulai percakapan</p>
            {availableContacts.length > 0 && (
              <button
                className={styles.startChatBtn}
                style={{ marginTop: 16 }}
                onClick={() => setShowNewChat(true)}
              >
                Hubungi Guru BK
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatAvatar}>
                {selectedName[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <h4 style={{ margin: 0 }}>{selectedName}</h4>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedRole}</span>
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
