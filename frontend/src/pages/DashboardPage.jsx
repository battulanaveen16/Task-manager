import React, { useEffect, useState } from 'react';
import { CheckSquare, Clock, AlertTriangle, Layers } from 'lucide-react';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const stored =
      JSON.parse(localStorage.getItem('projects')) || [];

    setProjects(stored);
  }, []);

  const handleCreateProject = () => {
    if (!projectName) return;

    const newProject = {
      id: Date.now(),
      name: projectName,
      description,
      task_count: 0,
      role: 'Owner',
    };

    const updatedProjects = [...projects, newProject];

    localStorage.setItem(
      'projects',
      JSON.stringify(updatedProjects)
    );

    setProjects(updatedProjects);

    setProjectName('');
    setDescription('');

    setShowModal(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>

        <button
          style={styles.button}
          onClick={() => setShowModal(true)}
        >
          + New Project
        </button>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<Layers size={20} />}
          label="Projects"
          value={projects.length}
        />

        <StatCard
          icon={<Clock size={20} />}
          label="In Progress"
          value={2}
        />

        <StatCard
          icon={<CheckSquare size={20} />}
          label="Completed"
          value={5}
        />

        <StatCard
          icon={<AlertTriangle size={20} />}
          label="Pending"
          value={1}
        />
      </div>

      <div style={styles.projectSection}>
        <h2>Your Projects</h2>

        {projects.length === 0 ? (
          <p>No projects yet</p>
        ) : (
          <div style={styles.projectGrid}>
            {projects.map((p) => (
              <div key={p.id} style={styles.projectCard}>
                <h3>{p.name}</h3>

                <p>{p.description}</p>

                <span>{p.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Create New Project</h2>

            <input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) =>
                setProjectName(e.target.value)
              }
              style={styles.input}
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              style={styles.textarea}
            />

            <div style={styles.modalButtons}>
              <button
                style={styles.button}
                onClick={handleCreateProject}
              >
                Create Project
              </button>

              <button
                style={styles.cancelButton}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={styles.card}>
      <div>{icon}</div>

      <h2>{value}</h2>

      <p>{label}</p>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    color: 'white',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '30px',
  },

  title: {
    fontSize: '32px',
  },

  button: {
    background: '#7c6af7',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
  },

  cancelButton: {
    background: '#444',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
    gap: '20px',
    marginBottom: '30px',
  },

  card: {
    background: '#111827',
    padding: '20px',
    borderRadius: '12px',
  },

  projectSection: {
    marginTop: '20px',
  },

  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
    gap: '20px',
    marginTop: '20px',
  },

  projectCard: {
    background: '#1f2937',
    padding: '20px',
    borderRadius: '12px',
  },

  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modal: {
    background: '#111827',
    padding: '30px',
    borderRadius: '12px',
    width: '400px',
  },

  input: {
    width: '100%',
    padding: '12px',
    marginTop: '15px',
    borderRadius: '8px',
    border: 'none',
  },

  textarea: {
    width: '100%',
    padding: '12px',
    marginTop: '15px',
    borderRadius: '8px',
    border: 'none',
    height: '100px',
  },

  modalButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
};