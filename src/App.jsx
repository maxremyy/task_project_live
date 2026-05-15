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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">ToDo Liste</h1>
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Neue Aufgabe hinzufügen..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            onClick={addTodo}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-5 py-2 transition-colors font-bold text-xl"
          >
            +
          </button>
        </div>
        <ul className="space-y-2">
          {todos.map((item) => (
            <li
              key={item.id}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 transition-all"
            >
              <span
                className={`flex-1 ${item.isCompleted ? "text-white/40 line-through" : "text-white"}`}
              >
                {item.toDoName}
              </span>
              <button
                onClick={() => completeToDo(item.id, item.isCompleted)}
                className="text-green-400 hover:text-green-300 transition-colors text-lg bg-transparent border-none p-1 cursor-pointer"
              >
                {item.isCompleted ? "↩" : "✓"}
              </button>
              <button
                onClick={() => deleteToDo(item.id)}
                className="text-red-400 hover:text-red-300 transition-colors text-lg bg-transparent border-none p-1 cursor-pointer"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
