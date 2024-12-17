<template>
    <div class="app">
      <!-- Bouton pour ouvrir le modal -->
      <button @click="showModal = true" class="add-task-btn">+ Ajouter une tâche</button>
  
      <!-- Liste des tâches -->
      <TaskList
        :tasks="tasks"
        @update-task="updateTask"
        @delete-task="deleteTask"
      />
  
      <!-- Modal pour ajouter une tâche -->
      <TaskModal
        v-if="showModal"
        @close="showModal = false"
        @add-task="addTask"
      />
    </div>
  </template>
  
  <script>
  import TaskList from "./TaskList.vue";
  import TaskModal from "./AddTaskModal.vue";
  
  export default {
    components: { TaskList, TaskModal },
    data() {
      return {
        tasks: [], // Liste des tâches
        showModal: false, // Contrôle la visibilité du modal
      };
    },
    methods: {
      // Ajouter une tâche
      addTask(newTask) {
        newTask.id = Date.now(); // Générer un ID unique
        this.tasks.push(newTask); // Ajouter la tâche à la liste
        this.showModal = false; // Fermer le modal
      },
      // Supprimer une tâche par son ID
      deleteTask(taskId) {
        console.log("ID à supprimer :", taskId); // Débogage
        const index = this.tasks.findIndex(task => task.id === taskId); // Trouver la tâche
        if (index !== -1) {
          this.tasks.splice(index, 1); // Supprimer la tâche
        }
        console.log("Liste après suppression :", this.tasks); // Débogage
      },
      // Mettre à jour une tâche existante
      updateTask(updatedTask) {
        const index = this.tasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
          this.tasks.splice(index, 1, updatedTask); // Remplacer la tâche
        }
      },
    },
  };
  </script>
  
  <style>
  .app {
    font-family: Arial, sans-serif;
    padding: 20px;
  }
  .add-task-btn {
    background-color: #4caf50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  </style>