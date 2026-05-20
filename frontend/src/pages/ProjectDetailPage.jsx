import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function ProjectDetailPage() {
  const { id } = useParams();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/tasks/project/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await axios.put(
        `${API}/tasks/${taskId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchTasks();
    } catch (err) {
      console.log(err);
    }
  };

  const getBadge = (status) => {
    const map = {
      "To Do": "todo",
      "In Progress": "progress",
      Done: "done",
    };

    return (
      <span className={`badge badge-${map[status] || "todo"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="page">
      <h1>Project Tasks</h1>

      {tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <div key={task._id} className="task-card">
              <h3>{task.title}</h3>

              <p>{task.description}</p>

              <p>
                <strong>Priority:</strong> {task.priority}
              </p>

              <p>
                <strong>Due:</strong>{" "}
                {new Date(task.dueDate).toLocaleDateString()}
              </p>

              <p>
                <strong>Status:</strong> {getBadge(task.status)}
              </p>

              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(task._id, e.target.value)
                }
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}