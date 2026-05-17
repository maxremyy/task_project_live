// Siehe beschreibung.txt fuer eine ausfuehrliche Erklaerung dieses Projekts
import { useEffect, useState } from "react";
import supabase from "./supabase-client";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // Auth: Session beim Start laden und auf Änderungen hören
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // READ
  useEffect(() => {
    if (!session) return;
    const fetchTodos = async () => {
      const { data, error } = await supabase.from("Tasks").select("*");
      if (error) console.error("Error fetching todos:", error);
      else setTodos(data);
    };
    fetchTodos();
  }, [session]);

  // CREATE
  const addTodo = async () => {
    const { data, error } = await supabase
      .from("Tasks")
      .insert([{ toDoName: newTodo, isCompleted: false, user_id: session.user.id }])
      .select()
      .single();
    if (error) console.error("Error adding todo:", error);
    else {
      setTodos([...todos, data]);
      setNewTodo("");
    }
  };

  // UPDATE
  const completeToDo = async (id, isCompleted) => {
    const { error } = await supabase
      .from("Tasks")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);
    if (error) console.error("Error updating todo:", error);
    else setTodos(todos.map((t) => (t.id === id ? { ...t, isCompleted: !isCompleted } : t)));
  };

  // DELETE
  const deleteToDo = async (id) => {
    const { error } = await supabase.from("Tasks").delete().eq("id", id);
    if (error) console.error("Error deleting todo:", error);
    else setTodos(todos.filter((t) => t.id !== id));
  };

  // redirectTo: window.location.origin sorgt dafuer, dass Supabase nach dem Login
  // zurueck zur aktuellen Domain leitet (localhost in Entwicklung, Vercel in Produktion).
  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

  const signOut = () => supabase.auth.signOut();

  const open = todos.filter((t) => !t.isCompleted);
  const done = todos.filter((t) => t.isCompleted);

  // Ladescreen
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Laden …
        </p>
      </div>
    );
  }

  // Login-Screen
  if (!session) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <p
          className="text-xs font-medium tracking-widest uppercase mb-4"
          style={{ color: "var(--color-accent)" }}
        >
          Aufgaben
        </p>
        <h1
          className="font-serif text-5xl leading-tight text-center mb-3"
          style={{ color: "var(--color-primary)" }}
        >
          Willkommen zurück.
        </h1>
        <p
          className="text-sm mb-10 text-center"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Melde dich an, um deine Aufgaben zu sehen.
        </p>
        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-3 rounded-xl px-6 py-3 text-sm font-medium transition-opacity hover:opacity-80 active:scale-95"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-primary)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Mit Google anmelden
        </button>
      </div>
    );
  }

  // App (eingeloggt)
  const userName = session.user.user_metadata?.full_name || session.user.email;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-16"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Header */}
      <header className="w-full max-w-xl mb-12">
        <div className="flex items-center justify-between mb-8">
          <p
            className="text-xs font-medium tracking-widest uppercase"
            style={{ color: "var(--color-accent)" }}
          >
            Aufgaben
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              {userName}
            </span>
            <button
              onClick={signOut}
              className="text-xs rounded-lg px-3 py-1.5 transition-opacity hover:opacity-70 cursor-pointer"
              style={{
                border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
                background: "none",
              }}
            >
              Abmelden
            </button>
          </div>
        </div>
        <h1
          className="font-serif text-5xl leading-tight"
          style={{ color: "var(--color-primary)" }}
        >
          Was steht heute an?
        </h1>
      </header>

      {/* Card */}
      <div
        className="w-full max-w-xl rounded-2xl p-8"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Input */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Neue Aufgabe …"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newTodo.trim() && addTodo()}
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              color: "var(--color-primary)",
              fontFamily: "Inter, sans-serif",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
          />
          <button
            onClick={() => newTodo.trim() && addTodo()}
            className="rounded-xl px-5 py-3 text-sm font-medium transition-opacity hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#FFFFFF",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Hinzufügen
          </button>
        </div>

        {/* Open tasks */}
        {open.length > 0 && (
          <section className="mb-6">
            <p
              className="text-xs font-medium tracking-widest uppercase mb-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Offen — {open.length}
            </p>
            <ul className="space-y-2">
              {open.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
                  style={{ border: "1px solid var(--color-border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <button
                    onClick={() => completeToDo(item.id, item.isCompleted)}
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
                    style={{
                      border: "1.5px solid var(--color-border)",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                    aria-label="Erledigt markieren"
                  />
                  <span className="flex-1 text-sm leading-relaxed" style={{ color: "var(--color-primary)" }}>
                    {item.toDoName}
                  </span>
                  <button
                    onClick={() => deleteToDo(item.id)}
                    className="text-xs opacity-30 hover:opacity-70 transition-opacity px-1 cursor-pointer"
                    style={{ color: "var(--color-primary)", background: "none", border: "none" }}
                    aria-label="Löschen"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Completed tasks */}
        {done.length > 0 && (
          <section>
            <p
              className="text-xs font-medium tracking-widest uppercase mb-3"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Erledigt — {done.length}
            </p>
            <ul className="space-y-2">
              {done.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-xl px-4 py-3">
                  <button
                    onClick={() => completeToDo(item.id, item.isCompleted)}
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center cursor-pointer"
                    style={{
                      border: "1.5px solid var(--color-accent)",
                      backgroundColor: "var(--color-accent)",
                      color: "#fff",
                      fontSize: "10px",
                    }}
                    aria-label="Rückgängig machen"
                  >
                    ✓
                  </button>
                  <span className="flex-1 text-sm line-through leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {item.toDoName}
                  </span>
                  <button
                    onClick={() => deleteToDo(item.id)}
                    className="text-xs opacity-30 hover:opacity-70 transition-opacity px-1 cursor-pointer"
                    style={{ color: "var(--color-primary)", background: "none", border: "none" }}
                    aria-label="Löschen"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Empty state */}
        {todos.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: "var(--color-text-secondary)" }}>
            Keine Aufgaben vorhanden.
          </p>
        )}
      </div>

      {/* Footer */}
      <p className="mt-10 text-xs tracking-wide" style={{ color: "var(--color-accent-muted)" }}>
        {open.length === 0 && todos.length > 0
          ? "Alles erledigt — gut gemacht."
          : `${open.length} ${open.length === 1 ? "Aufgabe" : "Aufgaben"} verbleibend`}
      </p>
    </div>
  );
}

export default App;
