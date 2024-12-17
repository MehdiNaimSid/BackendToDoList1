<template>
    <div class="modal">
      <div class="modal-content">
        <h2>Ajouter une nouvelle tâche</h2>
        <form @submit.prevent="submitTask">
          <div>
            <label for="title">Titre :</label>
            <input id="title" type="text" v-model="newTask.title" required />
          </div>
          <div>
            <label for="description">Description :</label>
            <textarea id="description" v-model="newTask.description"></textarea>
          </div>
          <div>
            <label for="priority">Priorité :</label>
            <select id="priority" v-model="newTask.priority">
              <option value="pas-prioritaire">Pas prioritaire</option>
              <option value="un-peu">Un peu</option>
              <option value="prioritaire">Prioritaire</option>
            </select>
          </div>
          <div class="form-group">
          <label for="deadline">Deadline (facultatif) :</label>
          <input id="deadline" type="date" v-model="newTask.deadline" />
        </div>
          <div class="buttons">
            <button type="submit">Ajouter</button>
            <button type="button" @click="$emit('close')">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  
  export default {
    data() {
      return {
        newTask: {
          title: '',
          description: '',
          priority: 'pas prioritaire',
          status: 'en cours',
          deadline: null // Deadline par défaut à null (aucune deadline)
        }
      };
    },
    methods: {
     
      submitTask() {
      this.$emit('add-task', { ...this.newTask }); // Emis avec les données du formulaire
      this.newTask = {
        title: '',
        description: '',
        priority: 'pas prioritaire',
        status: 'en cours',
        deadline: null // Réinitialise la deadline
        };
      }
    }
  };
  </script>
  
  <style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 400px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  .buttons {
    margin-top: 15px;
    display: flex;
    justify-content: space-between;
  }
  </style>
  