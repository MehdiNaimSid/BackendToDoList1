<template>
  <div class="task-list">
    <div class="task-container">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @update-task="updateTask"
        @delete-task="deleteTask"
      />
    </div>
  </div>
</template>

<script>
import TaskItem from "../components/TaskItem.vue";

export default {
  props: {
    tasks: Array,
  },
  components: { TaskItem },
  methods: {
    updateTask(updatedTask) {
      this.$emit("update-task", updatedTask); // Relais vers App.vue
    },
    deleteTask(taskId) {
      this.$emit("delete-task", taskId); // Relais vers App.vue
    },
  },
};
</script>
  
  <style scoped>
  .task-container {
    display: flex; /* Flexbox pour aligner les tâches en ligne */
    flex-wrap: wrap; /* Permet de faire passer les tâches à la ligne si elles dépassent */
    gap: 20px; /* Espacement entre les tâches */
  }
  
  .task-item {
    width: 200px; /* Largeur fixe pour chaque tâche */
    flex-shrink: 0; /* Empêche la tâche de se rétrécir */
  }
  </style>
  
  