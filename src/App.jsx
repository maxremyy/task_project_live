// Siehe beschreibung.txt fuer eine ausfuehrliche Erklaerung dieses Projekts
import { useEffect, useState } from "react";
import supabase from "./supabase-client";
import "./App.css";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  // READ - select() holt alle Eintraege aus der "ToDoList" Tabelle beim ersten Laden
  // REST: GET /rest/v1/ToDoList
  // useEffect mit leerem [] fuehrt die Funktion einmal beim ersten Rendern aus.
  // select("*") holt alle Spalten. Die Antwort wird in data (Array von Todos) oder error gespeichert.
  useEffect(() => {
    const fetchTodos = async () => {
      const { data, error } = await supabase.from("Tasks").select("*");

      if (error) {
        console.error("Error fetching todos:", error);
      } else {
        setTodos(data);
      }
    };
    fetchTodos();
  }, []);

  // CREATE - insert() fuegt einen neuen Eintrag in die "ToDoList" Tabelle ein
  // REST: POST /rest/v1/ToDoList
  // Erstellt ein Objekt mit toDoName und isCompleted, sendet es mit insert() an Supabase.
  // .single() gibt das eingefuegte Objekt direkt zurueck (statt ein Array).
  // Bei Erfolg wird das neue Todo dem lokalen State hinzugefuegt und das Input-Feld geleert.
  const addTodo = async () => {
    const newTodoData = {
      toDoName: newTodo,
      isCompleted: false,
    };
    const { data, error } = await supabase
      .from("Tasks")
      .insert([newTodoData])
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
    } else {
      setTodos([...todos, data]);
      setNewTodo("");
    }
  };

  // UPDATE - update() aendert den isCompleted-Status eines bestehenden Eintrags
  // REST: PATCH /rest/v1/ToDoList?id=eq.{id}
  // Invertiert den isCompleted-Wert mit !isCompleted und sendet ihn an Supabase.
  // .eq("id", id) filtert auf die richtige Zeile (WHERE id = ...).
  // Bei Erfolg wird der lokale State mit map() aktualisiert - nur das betroffene Todo wird geaendert.
  const completeToDo = async (id, isCompleted) => {
    const { error } = await supabase
      .from("Tasks")
      .update({ isCompleted: !isCompleted })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
    } else {
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo,
      );
      setTodos(updatedTodos);
    }
  };

  // DELETE - delete() loescht einen Eintrag aus der "ToDoList" Tabelle anhand der id
  // REST: DELETE /rest/v1/ToDoList?id=eq.{id}
  // .eq("id", id) waehlt die zu loeschende Zeile aus.
  // Bei Erfolg wird das Todo mit filter() aus dem lokalen State entfernt.
  const deleteToDo = async (id) => {
    const { error } = await supabase.from("Tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
    } else {
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
    }
  };

  const open = todos.filter((t) => !t.isCompleted);
  const done = todos.filter((t) => t.isCompleted);

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 py-16"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Header */}
      <header className="w-full max-w-xl mb-12 text-center">
        <p
          className="text-xs font-medium tracking-widest uppercase mb-3"
          style={{ color: "var(--color-accent)" }}
        >
          Aufgaben
        </p>
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
            onFocus={(e) =>
              (e.target.style.borderColor = "var(--color-accent)")
            }
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
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--color-bg)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <button
                    onClick={() => completeToDo(item.id, item.isCompleted)}
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors"
                    style={{
                      border: "1.5px solid var(--color-border)",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--color-accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--color-border)")
                    }
                    aria-label="Erledigt markieren"
                  />
                  <span
                    className="flex-1 text-sm leading-relaxed"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {item.toDoName}
                  </span>
                  <button
                    onClick={() => deleteToDo(item.id)}
                    className="text-xs opacity-30 hover:opacity-70 transition-opacity px-1 cursor-pointer"
                    style={{
                      color: "var(--color-primary)",
                      background: "none",
                      border: "none",
                    }}
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
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                >
                  <button
                    onClick={() => completeToDo(item.id, item.isCompleted)}
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer"
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
                  <span
                    className="flex-1 text-sm line-through leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {item.toDoName}
                  </span>
                  <button
                    onClick={() => deleteToDo(item.id)}
                    className="text-xs opacity-30 hover:opacity-70 transition-opacity px-1 cursor-pointer"
                    style={{
                      color: "var(--color-primary)",
                      background: "none",
                      border: "none",
                    }}
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
          <p
            className="text-sm text-center py-8"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Keine Aufgaben vorhanden.
          </p>
        )}
      </div>

      {/* Footer */}
      <p
        className="mt-10 text-xs tracking-wide"
        style={{ color: "var(--color-accent-muted)" }}
      >
        {open.length === 0 && todos.length > 0
          ? "Alles erledigt — gut gemacht."
          : `${open.length} ${open.length === 1 ? "Aufgabe" : "Aufgaben"} verbleibend`}
      </p>
    </div>
  );
}

export default App;
