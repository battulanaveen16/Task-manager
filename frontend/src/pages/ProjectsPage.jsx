import React, { useEffect, useState } from 'react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const user =
    JSON.parse(localStorage.getItem('user'));

  const userEmail = user?.email || 'guest';

  useEffect(() => {
    const stored =
      JSON.parse(
        localStorage.getItem(`projects_${userEmail}`)
      ) || [];

    setProjects(stored);
  }, [userEmail]);

  const createProject = () => {
    if (!name) return;

    const newProject = {
      id: Date.now(),
      name,
      description,
      owner: userEmail,
    };

    const updated = [...projects, newProject];

    localStorage.setItem(
      `projects_${userEmail}`,
      JSON.stringify(updated)
    );

    setProjects(updated);

    setName('');
    setDescription('');

    setShowModal(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Projects</h1>

        <button
          style={styles.button}
          onClick={() => setShowModal(true)}
        >
          + Create Project
        </button>
      </div>

      <div style={styles.grid}>
        {projects.map((project) => (
          <div key={project.id} style={styles.card}>
            <h2>{project.name}</h2>

            <p>{project.description}</p>

            <small>{project.owner}</small>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>Create Project</h2>

            <input
              type="text"
              placeholder="Project Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
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

            <div style={styles.actions}>
              <button
                style={styles.button}
                onClick={createProject}
              >
                Create
              </button>

              <button
                style={styles.cancel}
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

  button: {
    background: '#7c6af7',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
  },

  cancel: {
    background: '#444',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '10px',
    cursor: 'pointer',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
    gap: '20px',
  },

  card: {
    background: '#111827',
    padding: '20px',
    borderRadius: '12px',
  },

  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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

  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
  },
};