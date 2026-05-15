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
    <div>
      <h1>ToDo Liste</h1>
      <div>
        <input
          type="text"
          placeholder="Neue Aufgabe hinzufügen"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        ></input>
        <button onClick={addTodo}>ToDo Item hinzufügen</button>
      </div>
      <ul>
        {todos.map((item) => (
          <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ flex: 1 }}>{item.toDoName}</span>
            <button onClick={() => completeToDo(item.id, item.isCompleted)}>
              {item.isCompleted ? "Undo" : "Complete"}
            </button>
            <button onClick={() => deleteToDo(item.id)}>Delete ToDo</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
