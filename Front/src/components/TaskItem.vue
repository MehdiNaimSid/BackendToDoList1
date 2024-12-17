<template>
  <div :class="['task-item', { completed: task.status === 'terminé' }]">
    <!-- Rond pour la priorité -->
    <div :class="['priority-circle', task.priority]"></div>

    <!-- Checkbox pour changer le statut de la tâche -->
    <input
      type="checkbox"
      :checked="task.status === 'terminé'"
      @change="toggleStatus"
      class="checkbox"
    />

    <!-- Contenu de la tâche -->
    <div class="content">
      <h3>{{ task.title }}</h3>
      <p>{{ task.description }}</p>
      <p class="deadline">
        Deadline : {{ task.deadline ? formatDeadline(task.deadline) : 'Aucune' }}
      </p>
    </div>

    <!-- Menu à 3 points -->
    <div class="menu">
      <button @click="toggleMenu" class="menu-btn">⋮</button>
      <div v-if="isMenuVisible" class="menu-options">
        <button @click="editTask">Modifier</button>
        <button @click="$emit('delete-task', task.id)">Supprimer</button>
      </div>
    </div>

    <!-- Formulaire de modification de la tâche -->
    <div v-if="isEditing" class="edit-form">
      <input v-model="editTitle" placeholder="Titre" />
      <textarea v-model="editDescription" placeholder="Description"></textarea>
      
      <!-- Sélecteur de priorité -->
      <label for="priority">Priorité :</label>
      <select v-model="editPriority" id="priority">
        <option value="pas-prioritaire">Pas prioritaire</option>
        <option value="un-peu">Un peu</option>
        <option value="prioritaire">Prioritaire</option>
      </select>
      <label for="edit-deadline">Deadline (facultatif) :</label>
      <input
        id="edit-deadline"
        type="date"
        v-model="editDeadline"
        placeholder="Aucune"
      />
      
      <button @click="saveChanges">Enregistrer</button>
      <button @click="cancelEdit">Annuler</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    task: Object
  },
  data() {
    return {
      isMenuVisible: false, // Contrôle la visibilité du menu à 3 points
      isEditing: false,     // Contrôle si la tâche est en mode édition
      editTitle: this.task.title,
      editDescription: this.task.description,
      editPriority: this.task.priority, // Priorité pour la modification
      editDeadline: this.task.deadline // Initialisation avec la valeur actuelle
    };
  },
  methods: {
    // Toggle the menu visibility (open/close)
    toggleMenu() {
      this.isMenuVisible = !this.isMenuVisible;
    },

    // Edit the task - show the editing form
    editTask() {
      this.isEditing = true;
      this.isMenuVisible = false; // Ferme le menu après l'édition
    },

    // Save the changes made to the task
    saveChanges() {
      this.$emit('update-task', {
        ...this.task,
        title: this.editTitle,
        description: this.editDescription,
        priority: this.editPriority ,// Ajout de la priorité modifiée
        deadline: this.editDeadline // Met à jour la deadline (peut être null)
      });
      this.isEditing = false; // Ferme le formulaire d'édition
    },

    // Cancel editing (restore original values)
    cancelEdit() {
      this.editTitle = this.task.title;
      this.editDescription = this.task.description;
      this.editPriority = this.task.priority; // Réinitialise la priorité
      this.isEditing = false; // Ferme le formulaire d'édition
    },

    deleteTask() {
      console.log("Suppression de la tâche avec ID:", this.task.id);
  this.$emit('delete-task', this.task.id); // Envoie l'ID de la tâche à supprimer
},

    // Toggle the task status between 'in progress' and 'completed'
    toggleStatus() {
      const updatedTask = { ...this.task, status: this.task.status === 'terminé' ? 'en cours' : 'terminé' };
      this.$emit('update-task', updatedTask)},
      formatDeadline(deadline) {
      if (!deadline) return 'Non définie';
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(deadline).toLocaleDateString('fr-FR', options);
    }
  }
};
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 15px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative; /* Pour positionner le menu et le formulaire */
}

.task-item.completed {
  background-color: #e0e0e0;
  opacity: 0.7;
}

.checkbox {
  margin-right: 15px;
}

.content {
  flex-grow: 1;
}

h3 {
  margin: 0;
  font-size: 18px;
}

p {
  margin: 5px 0;
  font-size: 14px;
  color: #555;
}

/* Rond pour la priorité */
.priority-circle {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

/* Couleurs du rond en fonction de la priorité */
.priority-circle.pas-prioritaire {
  background-color: green;
}

.priority-circle.un-peu {
  background-color: yellow;
}

.priority-circle.prioritaire {
  background-color: red;
}

/* Menu à 3 points */
.menu {
  position: absolute;
  top: 10px;
  right: 10px;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.menu-options {
  position: absolute;
  top: 20px;
  right: 0;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
}

.menu-options button {
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

/* Formulaire de modification de la tâche */
.edit-form {
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
}

.edit-form input,
.edit-form textarea,
.edit-form select {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.edit-form button {
  margin-top: 10px;
  padding: 10px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-form button:last-child {
  background-color: #f44336;
}
</style>
